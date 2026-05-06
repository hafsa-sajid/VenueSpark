import axios from 'axios';
import React, { useContext, useState, createContext, useEffect, useCallback } from 'react';
import { authDataContext } from './AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const listingDataContext = createContext();

function ListingContext({ children }) {
    let navigate = useNavigate();
    
    // Form States
    let [title, setTitle] = useState("");
    let [description, setDescription] = useState("");
    
    // Image States
    let [frontEndImage1, setFrontEndImage1] = useState(null);
    let [frontEndImage2, setFrontEndImage2] = useState(null);
    let [frontEndImage3, setFrontEndImage3] = useState(null);
    let [backEndImage1, setBackEndImage1] = useState(null);
    let [backEndImage2, setBackEndImage2] = useState(null);
    let [backEndImage3, setBackEndImage3] = useState(null);
    
    let [rent, setRent] = useState("");
    let [city, setCity] = useState("");
    let [landmark, setLandMark] = useState(""); 
    let [latitude, setLatitude] = useState(null);
    let [longitude, setLongitude] = useState(null);
    let [category, setCategory] = useState("");
    
    // Status States
    let [adding, setAdding] = useState(false);
    let [updating, setUpdating] = useState(false);
    let [deleting, setDeleting] = useState(false);

    // Data States
    let [listingData, setListingData] = useState([]);
    let [newListData, setNewListData] = useState([]);
    let [cardDetails, setCardDetails] = useState(null);
    let [searchData, setSearchData] = useState([]);
    let [selectedCategory, setSelectedCategory] = useState("trending");

    let { serverUrl } = useContext(authDataContext);

    // --- Reset Form Function ---
    const resetForm = () => {
        setTitle("");
        setDescription("");
        setFrontEndImage1(null);
        setFrontEndImage2(null);
        setFrontEndImage3(null);
        setBackEndImage1(null);
        setBackEndImage2(null);
        setBackEndImage3(null);
        setRent("");
        setCity("");
        setLandMark("");
        setLatitude(null);
        setLongitude(null);
        setCategory("");
    };

    // --- FIX 1: Optimized Search Logic ---
    const handleSearch = async (query) => {
        // Agar input khali hai ya sirf spaces hain
        if (!query || query.trim() === "") {
            setSearchData([]); 
            return;
        }

        try {
            // Encode query to handle special characters/spaces
            let result = await axios.get(`${serverUrl}/api/listing/search?query=${encodeURIComponent(query)}`);
            setSearchData(result.data);
        } catch (error) {
            setSearchData([]); 
            // Sirf zaroori error log karein
            if (error.response?.status !== 400) {
                console.error("Search error:", error);
            }
        }
    };

    // --- FIX 2: Listing Fetch Logic ---
    const getListing = useCallback(async () => {
        try {
            let result = await axios.get(`${serverUrl}/api/listing/get`, { withCredentials: true });
            
            let token = localStorage.getItem('token');
            let userBookings = [];
            
            if (token) {
                try {
                    const bookingRes = await axios.get(`${serverUrl}/api/booking/user-bookings`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    userBookings = bookingRes.data;
                } catch (err) {
                    console.log("User not logged in or booking fetch failed");
                }
            }

            const listingsWithBookingId = result.data.map(listing => {
                const foundBooking = userBookings.find(b => 
                    (b.listing === listing._id || b.listing?._id === listing._id)
                );
                return {
                    ...listing,
                    bookingId: foundBooking ? foundBooking._id : (listing.bookingId || null)
                };
            });

            setListingData(listingsWithBookingId);
            setNewListData(prev => {
                // If there's an active category filter, preserve it
                if (selectedCategory && selectedCategory !== "trending") {
                    return listingsWithBookingId.filter(list => list.category?.toLowerCase() === selectedCategory.toLowerCase());
                }
                return listingsWithBookingId;
            });
        } catch (error) {
            console.error("Error fetching listings:", error);
        }
    }, [serverUrl]);

    // --- Add Listing Logic ---
    let handleAddListing = async () => {
        let token = localStorage.getItem('token'); 
        setAdding(true);

        try {
            if (!token) {
                toast.error("Please log in to add a listing.");
                setAdding(false);
                return;
            }

            let formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("rent", rent);
            formData.append("city", city);
            formData.append("landmark", landmark); 
            if (latitude) formData.append("latitude", latitude);
            if (longitude) formData.append("longitude", longitude);
            formData.append("category", category);

            if (backEndImage1) formData.append("image1", backEndImage1);
            if (backEndImage2) formData.append("image2", backEndImage2);
            if (backEndImage3) formData.append("image3", backEndImage3);

            await axios.post(
                `${serverUrl}/api/listing/add`,
                formData,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            
            setAdding(false);
            if (resetForm) resetForm();
            toast.success("Listing Added Successfully!");
            getListing(); 
            navigate("/");
        } catch (error) {
            setAdding(false);
            const message = error.response?.data?.message || "Something went wrong!";
            toast.error(message);
        }
    };

    const handleViewCard = async (id) => {
        let token = localStorage.getItem('token');
        try {
            let result = await axios.get(`${serverUrl}/api/listing/findListingById/${id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            });
            setCardDetails(result.data);
            navigate("/viewcard");
        } catch (error) {
            toast.error(error.response?.data?.message || "Listing not found");
        }
    };
    
    useEffect(() => {
        getListing();
    }, [getListing, adding, updating, deleting]);

    let value = {
        title, setTitle,
        description, setDescription,
        frontEndImage1, setFrontEndImage1,
        frontEndImage2, setFrontEndImage2,
        frontEndImage3, setFrontEndImage3,
        backEndImage1, setBackEndImage1,
        backEndImage2, setBackEndImage2,
        backEndImage3, setBackEndImage3,
        rent, setRent,
        city, setCity,
        landmark, setLandMark,
        latitude, setLatitude,
        longitude, setLongitude,
        category, setCategory,
        handleAddListing,
        adding, setAdding,
        listingData, setListingData,
        newListData, setNewListData,
        handleViewCard,
        cardDetails, setCardDetails,
        updating, setUpdating,
        getListing,
        deleting, setDeleting,
        handleSearch,
        searchData, setSearchData,
        resetForm,
        selectedCategory, setSelectedCategory,
    };

    return (
        <listingDataContext.Provider value={value}>
            {children}
        </listingDataContext.Provider>
    );
}

export default ListingContext;