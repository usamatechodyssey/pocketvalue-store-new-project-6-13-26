// // /lib/pakistan-data.ts

// export const provinces = [
//     // { value: "Punjab", label: "Punjab" },
//     { value: "Sindh", label: "Sindh" },
//     // { value: "Khyber Pakhtunkhwa", label: "Khyber Pakhtunkhwa" },
//     // { value: "Balochistan", label: "Balochistan" },
//     // { value: "Islamabad Capital Territory", label: "Islamabad" },
//     // { value: "Gilgit-Baltistan", label: "Gilgit-Baltistan" },
//     // { value: "Azad Kashmir", label: "Azad Kashmir" },
// ];

// export const citiesByProvince: { [key: string]: { value: string; label: string }[] } = {
//     // "Punjab": [ { value: "Lahore", label: "Lahore" }, { value: "Faisalabad", label: "Faisalabad" }, { value: "Rawalpindi", label: "Rawalpindi" }, { value: "Multan", label: "Multan" }, { value: "Gujranwala", label: "Gujranwala" }, /* ...aur bohat se sheher */ ],
//     "Sindh": [ { value: "Karachi", label: "Karachi" }, { value: "Hyderabad", label: "Hyderabad" }, { value: "Sukkur", label: "Sukkur" }, { value: "Larkana", label: "Larkana" }, /* ... */ ],
//     // "Khyber Pakhtunkhwa": [ { value: "Peshawar", label: "Peshawar" }, { value: "Abbottabad", label: "Abbottabad" }, { value: "Mardan", label: "Mardan" }, /* ... */ ],
//     // "Balochistan": [ { value: "Quetta", label: "Quetta" }, { value: "Gwadar", label: "Gwadar" }, /* ... */ ],
//     // "Islamabad Capital Territory": [ { value: "Islamabad", label: "Islamabad" } ],
//     // ... baaki provinces ke sheher
// };

// // NOTE: Yeh list abhi mukhtasar hai. Hum ismein GitHub par mojood open-source data se tamam sheher add kar sakte hain.
// /lib/pakistan-data.ts

export const provinces = [
    { value: "Sindh", label: "Sindh" },
    // Future Expansion ke liye commented out:
    // { value: "Punjab", label: "Punjab" },
    // { value: "Khyber Pakhtunkhwa", label: "Khyber Pakhtunkhwa" },
    // { value: "Balochistan", label: "Balochistan" },
    // { value: "Islamabad Capital Territory", label: "Islamabad" },
    // { value: "Gilgit-Baltistan", label: "Gilgit-Baltistan" },
    // { value: "Azad Kashmir", label: "Azad Kashmir" },
];

export const citiesByProvince: { [key: string]: { value: string; label: string }[] } = {
    "Sindh": [
        { value: "Badin", label: "Badin" },
        { value: "Bhiria City", label: "Bhiria City" },
        { value: "Choro", label: "Choro" },
        { value: "Dadu", label: "Dadu" },
        { value: "Daharki", label: "Daharki" },
        { value: "Digri", label: "Digri" },
        { value: "Diplo", label: "Diplo" },
        { value: "Dokri", label: "Dokri" },
        { value: "Gambat", label: "Gambat" },
        { value: "Ghotki", label: "Ghotki" },
        { value: "Hala", label: "Hala" },
        { value: "Hyderabad", label: "Hyderabad" },
        { value: "Islamkot", label: "Islamkot" },
        { value: "Jacobabad", label: "Jacobabad" },
        { value: "Jamshoro", label: "Jamshoro" },
        { value: "Jungshahi", label: "Jungshahi" },
        { value: "Kandhkot", label: "Kandhkot" },
        { value: "Kandiaro", label: "Kandiaro" },
        { value: "Karachi", label: "Karachi" },
        { value: "Kashmore", label: "Kashmore" },
        { value: "Keti Bandar", label: "Keti Bandar" },
        { value: "Khairpur", label: "Khairpur" },
        { value: "Khipro", label: "Khipro" },
        { value: "Kotri", label: "Kotri" },
        { value: "Larkana", label: "Larkana" },
        { value: "Matiari", label: "Matiari" },
        { value: "Mehar", label: "Mehar" },
        { value: "Mirpur Bathoro", label: "Mirpur Bathoro" },
        { value: "Mirpur Mathelo", label: "Mirpur Mathelo" },
        { value: "Mirpur Sakro", label: "Mirpur Sakro" },
        { value: "Mirpurkhas", label: "Mirpurkhas" },
        { value: "Mithi", label: "Mithi" },
        { value: "Moro", label: "Moro" },
        { value: "Nagarparkar", label: "Nagarparkar" },
        { value: "Naudero", label: "Naudero" },
        { value: "Naushahro Feroze", label: "Naushahro Feroze" },
        { value: "Nawabshah", label: "Nawabshah (Shaheed Benazirabad)" },
        { value: "Pano Aqil", label: "Pano Aqil" },
        { value: "Ranipur", label: "Ranipur" },
        { value: "Ratodero", label: "Ratodero" },
        { value: "Rohri", label: "Rohri" },
        { value: "Sakrand", label: "Sakrand" },
        { value: "Sanghar", label: "Sanghar" },
        { value: "Sehwan", label: "Sehwan" },
        { value: "Shahdadkot", label: "Shahdadkot" },
        { value: "Shahdadpur", label: "Shahdadpur" },
        { value: "Shahpur Chakar", label: "Shahpur Chakar" },
        { value: "Shikarpur", label: "Shikarpur" },
        { value: "Sinjhoro", label: "Sinjhoro" },
        { value: "Sukkur", label: "Sukkur" },
        { value: "Tando Adam", label: "Tando Adam" },
        { value: "Tando Allahyar", label: "Tando Allahyar" },
        { value: "Tando Bago", label: "Tando Bago" },
        { value: "Tando Muhammad Khan", label: "Tando Muhammad Khan" },
        { value: "Thari Mirwah", label: "Thari Mirwah" },
        { value: "Thatta", label: "Thatta" },
        { value: "Thul", label: "Thul" },
        { value: "Ubauro", label: "Ubauro" },
        { value: "Umerkot", label: "Umerkot" },
        { value: "Warah", label: "Warah" },
        // Safe option agar koi sheher list me na ho:
        { value: "Other", label: "Other / Other City" }
    ],
    // "Punjab": [],
    // "Khyber Pakhtunkhwa": [],
    // "Balochistan": [],
};