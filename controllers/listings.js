const Listing = require("../models/listing.js");
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const categoryFilters = {
  trending: {
    label: "Trending",
    icon: "fa-solid fa-fire",
    terms: ["beach", "villa", "luxury", "penthouse", "paradise", "retreat"],
  },
  rooms: {
    label: "Rooms",
    icon: "fa-solid fa-bed",
    terms: ["room", "apartment", "loft", "brownstone", "house", "cottage"],
  },
  iconic_cities: {
    label: "Iconic Cities",
    icon: "fa-solid fa-mountain-city",
    terms: ["new york", "tokyo", "miami", "boston", "amsterdam", "dubai", "los angeles"],
  },
  mountains: {
    label: "Mountains",
    icon: "fa-solid fa-mountain",
    terms: ["mountain", "aspen", "banff", "ski", "chalet", "alps", "montana"],
  },
  castles: {
    label: "Castles",
    icon: "fa-brands fa-fort-awesome",
    terms: ["castle", "historic", "villa", "scotland", "tuscany"],
  },
  pools: {
    label: "Amazing pool",
    icon: "fa-solid fa-person-swimming",
    terms: ["pool", "villa", "luxury", "resort", "phuket", "bali", "dubai"],
  },
  camping: {
    label: "Camping",
    icon: "fa-solid fa-campground",
    terms: ["camp", "cabin", "treehouse", "lake", "forest", "retreat"],
  },
  farms: {
    label: "Farms",
    icon: "fa-solid fa-cow",
    terms: ["farm", "rustic", "cottage", "cotswolds", "montana", "countryside"],
  },
  arctic: {
    label: "Arctic",
    icon: "fa-solid fa-snowflake",
    terms: ["arctic", "snow", "ski", "chalet", "banff", "aspen", "swiss"],
  },
  domes: {
    label: "Domes",
    icon: "fa-solid fa-igloo",
    terms: ["dome", "igloo", "eco", "treehouse", "unique", "retreat"],
  },
  boats: {
    label: "Boats",
    icon: "fa-solid fa-ship",
    terms: ["boat", "island", "beach", "lake", "canal", "water", "maldives"],
  },
};

const searchableFields = ["title", "description", "location", "country"];

const buildTextSearch = (terms) => ({
  $or: searchableFields.map((field) => ({
    [field]: { $regex: terms.map(escapeRegex).join("|"), $options: "i" },
  })),
});

module.exports.index = async(req,res)=>{
  const searchQuery = (req.query.q || "").trim();
  const activeCategory = req.query.category || "";
  const filters = [];

  if (searchQuery) {
    const searchRegex = escapeRegex(searchQuery);
    filters.push({
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchRegex, $options: "i" },
      })),
    });
  }

  if (categoryFilters[activeCategory]) {
    filters.push(buildTextSearch(categoryFilters[activeCategory].terms));
  }

  const query = filters.length ? { $and: filters } : {};
  const allListing= await Listing.find(query);
  const filterLabel = categoryFilters[activeCategory]?.label || "";
  const pageTitle = searchQuery || filterLabel
    ? `${searchQuery || filterLabel} stays - WanderLust`
    : "WanderLust - Vacation Rentals, Homes, Villas, and Unique Stays";

  res.render("listings/index.ejs",{
    allListing,
    categories: categoryFilters,
    activeCategory,
    searchQuery,
    resultMessage: searchQuery || filterLabel
      ? `Showing stays for ${[searchQuery, filterLabel].filter(Boolean).join(" in ")}`
      : "",
    seo: {
      title: pageTitle,
      description: searchQuery || filterLabel
        ? `Find ${searchQuery || filterLabel} vacation rentals, homes, villas, cabins, and unique stays on WanderLust.`
        : "Explore vacation rentals by name, destination, and stay type on WanderLust.",
      keywords: [
        "WanderLust",
        "vacation rentals",
        "homes",
        "villas",
        "cottages",
        "cabins",
        "unique stays",
        searchQuery,
        filterLabel,
      ].filter(Boolean).join(", "),
      image: allListing[0]?.image?.url || "",
      url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    },
  });
};

module.exports.renderNewForm = (req,res)=>{
res.render("listings/new.ejs", {
  seo: {
    title: "Add a New Stay - WanderLust",
    description: "List a vacation rental, villa, cabin, cottage, or unique stay on WanderLust.",
    keywords: "add listing, list vacation rental, WanderLust host, new stay",
    image: "",
    url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
  },
});
};
module.exports.showListing = async (req,res,next)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate( {path:"reviews", populate:{
      path:"author",
    },
  })
    .populate("owner");
    if(!listing){
      req.flash("error"," Listing you requested for does not exist");
      return res.redirect("/listings");
    }
    const locationText = [listing.location, listing.country].filter(Boolean).join(", ");
    const description = `${listing.title}${locationText ? ` in ${locationText}` : ""}. ${listing.description || "Book this unique stay on WanderLust."}`;
    res.render("listings/show.ejs",{
      listing,
      seo: {
        title: `${listing.title} - WanderLust`,
        description: description.slice(0, 160),
        keywords: [
          listing.title,
          listing.location,
          listing.country,
          "WanderLust",
          "vacation rental",
          "stay",
        ].filter(Boolean).join(", "),
        image: listing.image?.url || "",
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });

};

module.exports.createListing = async(req,res,next)=>{
  let url = req.file.path;
  let filename = req.file.filename;

 const newListing  =   new Listing(req.body.listing);
 newListing.owner = req.user._id;
 newListing.image = {url,filename};
 await newListing.save();
 req.flash("success","New Listing Created!");
 res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url || "";
    let resizedImageUrl = originalImageUrl;

    if (originalImageUrl) {
        // Cloudinary transformation: h=200, w=300 (adjust as needed)
        resizedImageUrl = originalImageUrl.replace("/upload", "/upload/w_300,h_200,c_fit");
    }

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl: resizedImageUrl,
        seo: {
            title: `Edit ${listing.title} - WanderLust`,
            description: `Edit details for ${listing.title} on WanderLust.`,
            keywords: `${listing.title}, edit listing, WanderLust`,
            image: listing.image?.url || "",
            url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        },
    });
};



module.exports.updateListing = async(req,res,)=>{
    let {id} =req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !=="undefined"){
  let url = req.file.path;
  let filename = req.file.filename;
   listing.image = {url,filename};
   await listing.save();
    }

   req.flash("success","Listing Updated");
   res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async(req,res)=>{
let {id} =req.params;
 let deletedListings = await Listing.findByIdAndDelete(id);
 console.log(deletedListings);
 req.flash("success","Listing Deleted!");
 res.redirect("/listings");
};
