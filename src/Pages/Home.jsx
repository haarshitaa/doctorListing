import axios from "axios";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const listVariants ={
  hidden:{opacity: 0 },
  visible:{
    opacity:1,
    transition: {when:"beforeChildren",staggerChildren: 0.1},
  },
};
const cardVariants={
  hidden:{ opacity: 0,y: 20},
  visible:{opacity: 1,y: 0, transition:{type: "spring",stiffness: 100}},
  exit: { opacity: 0, y:-20, transition:{ duration: 0.2 }},
};


const suggestionVariants ={
  hidden:{ height: 0, opacity: 0 },
  visible: { height:"auto",opacity:1,transition:{duration: 0.2 }},
};

export function Home() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] =useState("");
  const [searchSuggestions, setSearchSuggestions]= useState([]);
  const [showSuggestions, setShowSuggestions] =useState(false);
  const [searchParams, setSearchParams] =useSearchParams();
  const [filters, setFilters] =useState({
    consultationType: searchParams.get("consultationType") ||null,
    specialties:searchParams.get("specialties")
      ? searchParams.get("specialties").split(",")
      : [],
    sortOption: searchParams.get("sortOption") ||null,
  });

  const consultationTypes =[
    {value:"video", label:"Video Consultation"},
    {value: "clinic", label:"In-Clinic Consultation"},
    {value: "all",label:"All"},
  ];

  const allSpecialties=[
    "General Physician",
    "Dentist",
    "Dermatologist",
    "Paediatrician",
    "Gynaecologist",
    "ENT",
    "Diabetologist",
    "Cardiologist",
    "Physiotherapist",
    "Endocrinologist",
    "Orthopaedic",
    "Ophthalmologist",
    "Gastroenterologist",
    "Pulmonologist",
    "Psychiatrist",
    "Urologist",
    "Dietitian/Nutritionist",
    "Psychologist",
    "Sexologist",
    "Nephrologist",
    "Neurologist",
    "Oncologist",
    "Ayurveda",
    "Homeopath",
  ];

  useEffect(()=>{
    const fetchDoctors = async () =>{
      // console.log("before");
      try{
        const response = await axios.get(
          "https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json"
        );
        // console.log(response.data);
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() =>{
    applyFilters();
    updateURLParams();
  }, [searchQuery,filters,doctors]);

  const updateURLParams = () => {
    const params ={};
    if (searchQuery) params.search =searchQuery;
    if (filters.consultationType) params.consultationType = filters.consultationType;
    if (filters.specialties.length) params.specialties = filters.specialties.join(",");
    if (filters.sortOption) params.sortOption = filters.sortOption;
    setSearchParams(params);
  };

  const applyFilters =() =>{
    let results =[...doctors];

    if (searchQuery){
      results = results.filter((d)=>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.consultationType &&filters.consultationType !=="all"){
      results = results.filter((d)=>
        filters.consultationType === "video" ? d.video_consult : d.in_clinic
      );
    }

    if(filters.specialties.length){
      results = results.filter((d)=>
        d.specialities?.some((s) =>filters.specialties.includes(s.name))
      );
    }

    if(filters.sortOption==="fees"){
      results.sort((a,b) =>{
        const feeA = parseInt(a.fees?.replace(/[^0-9]/g, "") || 0);
        const feeB = parseInt(b.fees?.replace(/[^0-9]/g, "") || 0);
        return feeA - feeB;
      });
    } 
    else if(filters.sortOption==="experience"){
      results.sort((a,b) => {
        const expA = parseInt(a.experience?.match(/\d+/)?.[0] || 0);
        const expB = parseInt(b.experience?.match(/\d+/)?.[0] ||0);
        return expB - expA;
      });
    }
    setFilteredDoctors(results);
  };

  const handleSearchChange=(e) =>{
    const query =e.target.value;
    setSearchQuery(query);

    if(query.length >0){
      const matches =doctors
        .filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3);
      setSearchSuggestions(matches);
    }else{
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick =(doc) =>{
    setSearchQuery(doc.name);
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const handleConsultationTypeChange =(type)=>
    setFilters((prev) =>({ ...prev, consultationType: type }));

  const handleSpecialtyToggle= (spec)=>
    setFilters((prev)=> ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter((s) => s!==spec)
        : [...prev.specialties, spec],
    }));

  const handleSortChange = (opt) =>
    setFilters((prev) => ({
      ...prev,
      sortOption: prev.sortOption ===opt ? null : opt,
    }));

  const resetFilters=() =>{
    setFilters({ consultationType: null,specialties: [], sortOption: null});
    setSearchQuery("");
    setSearchSuggestions([]);
  };

  const getSpecialtyNames=(specs) =>
    specs?.map((s)=> s.name).join(", ")||"No specialties listed";

  const getExperienceYears = (exp) => `${exp?.match(/\d+/)?.[0] || 0} yrs exp.`;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <input
            data-testid="autocomplete-input"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search Symptoms, Doctors, Specialists, Clinics"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={()=>setShowSuggestions(true)}
            onBlur={()=>setTimeout(() =>setShowSuggestions(false), 200)}
          />

          <AnimatePresence>
            {showSuggestions&&searchSuggestions.length > 0 && (
              <motion.div
                variants={suggestionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
              >
                {searchSuggestions.map((doc) => (
                  <motion.div
                    key={doc.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSuggestionClick(doc)}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                  >
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/40?text=DR";
                      }}
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">
                        {doc.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {doc.specialities?.[0]?.name || "Unknown"}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">

        <motion.div
          className="w-full md:w-64 bg-white p-4 rounded-lg shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">Sort by</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.sortOption === "fees"}
                  onChange={() => handleSortChange("fees")}
                  className="mr-2"
                />
                <label>Fees Low-High</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.sortOption === "experience"}
                  onChange={() => handleSortChange("experience")}
                  className="mr-2"
                />
                <label>Experience - Most Experienced</label>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">Specialities</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allSpecialties.map(specialty => (
                <div key={specialty} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.specialties.includes(specialty)}
                    onChange={() => handleSpecialtyToggle(specialty)}
                    className="mr-2"
                  />
                  <label>{specialty}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">Mode of consultation</h3>
            <div className="space-y-2">
              {consultationTypes.map(type => (
                <div key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    name="consultationType"
                    checked={filters.consultationType === type.value}
                    onChange={() => handleConsultationTypeChange(type.value)}
                    className="mr-2"
                  />
                  <label>{type.label}</label>
                </div>
              ))}
            </div>
          </div>          
          <button  onClick={resetFilters} className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg" >
            Reset All
          </button>
        </motion.div>
        <motion.div
          className="flex-1"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <motion.div
                  key={doctor.id}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4"
                  variants={cardVariants}
                  exit="exit"
                >
                  <div className="flex gap-4 items-start">
                 
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img 
                        src={doctor.photo} 
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "https://via.placeholder.com/80?text=DR";
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{doctor.name}</h3>
                          <p className="text-gray-600">
                            {getSpecialtyNames(doctor.specialities)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {doctor.doctor_introduction?.split(',')[0] || ''}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {getExperienceYears(doctor.experience)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{doctor.fees}</p>
                          {doctor.clinic && (
                            <p className="text-xs text-gray-500 mt-1">
                              {doctor.clinic.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="bg-white p-8 rounded-lg shadow-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p>No doctors found matching your criteria</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg"
                >
                  Reset filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
