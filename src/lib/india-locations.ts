// Indian States/UTs with their districts.
// Kerala has the full district list; other states list "Other" as a
// catch-all so the form remains usable countrywide without bloating bundle.

export const INDIA_STATES_DISTRICTS: Record<string, string[]> = {
  "Kerala": [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam",
    "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
    "Thiruvananthapuram", "Thrissur", "Wayanad",
  ],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Other"],
  "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubballi-Dharwad", "Belagavi", "Other"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Other"],
  "Telangana": ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Other"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Other"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Other"],
  "Goa": ["North Goa", "South Goa"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Other"],
  "Haryana": ["Gurugram", "Faridabad", "Other"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Other"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Other"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Ghaziabad", "Other"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Other"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Other"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Other"],
  "Bihar": ["Patna", "Gaya", "Other"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Other"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Other"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Other"],
  "Assam": ["Guwahati", "Dibrugarh", "Other"],
  "Arunachal Pradesh": ["Itanagar", "Other"],
  "Manipur": ["Imphal", "Other"],
  "Meghalaya": ["Shillong", "Other"],
  "Mizoram": ["Aizawl", "Other"],
  "Nagaland": ["Kohima", "Dimapur", "Other"],
  "Sikkim": ["Gangtok", "Other"],
  "Tripura": ["Agartala", "Other"],
  "Himachal Pradesh": ["Shimla", "Other"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Other"],
  "Ladakh": ["Leh", "Kargil"],
  "Andaman and Nicobar Islands": ["Port Blair", "Other"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Lakshadweep": ["Kavaratti", "Other"],
  "Puducherry": ["Puducherry", "Karaikal", "Other"],
};

export const INDIA_STATES = Object.keys(INDIA_STATES_DISTRICTS).sort();

export function getDistricts(state: string): string[] {
  return INDIA_STATES_DISTRICTS[state] || [];
}

export const PINCODE_REGEX = /^[1-9]\d{5}$/;
