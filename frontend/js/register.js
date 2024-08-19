export async function insertUser(formValues) {
    const API_URL = "http://localhost:8080/user/register"

    const {
        firstName,
        middleInitial,
        lastName,
        gender,
        address,
        city,
        birthdate, // Assuming birthdate is in dd-mm-yyyy format
        contactNumber,
        email,
        disability, // This will be the selected disability name
        password,
        reEnterPassword,
        idPicture,
        profilePicture,
        selfieWithID
    } = formValues

    // Map of disability names to their corresponding IDs
    const disabilityMap = {
        hearing: 1,           // Example ID, adjust as necessary
        intellectual: 2,
        learning: 3,
        mental: 4,
        physical: 5,
        psychosocial: 6,
        speech: 7,
        visual: 8,
        cancer: 9,
        rare: 10
    }

    // Convert disability name to ID
    const disabilityID = disabilityMap[disability]

    // Convert birthdate from dd-mm-yyyy to yyyy-mm-dd
    const [day, month, year] = birthdate.split('-').map(Number);
    const formattedBirthdate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    // Validate input fields
    if (firstName.trim() === '' || !validateAlphabetical(firstName)) {
        alert('Invalid first name')
        return Promise.reject('Invalid first name')
    } else if (lastName.trim() === '' || !validateAlphabetical(lastName)) {
        alert('Invalid last name')
        return Promise.reject('Invalid last name')
    } else if (address.trim() === '' || !validateCity(address)) {
        alert('Invalid address')
        return Promise.reject('Invalid address')
    } else if (email.trim() === '' || !validateEmail(email)) {
        alert('Invalid email')
        return Promise.reject('Invalid email')
    } else if (contactNumber.trim() === '' || !validateNumber(contactNumber)) {
        alert('Invalid contact number')
        return Promise.reject('Invalid contact number')
    } else if (password !== reEnterPassword) {
        alert('Passwords do not match')
        return Promise.reject('Passwords do not match')
    }

    const body = {
        first_name: firstName,
        middle_initial: middleInitial,
        last_name: lastName,
        gender: gender,
        address: address,
        city: city,
        birthdate: formattedBirthdate, // Use the formatted birthdate
        contact_number: contactNumber,
        email: email,
        disability: disabilityID, // Pass the disability ID instead of name
        password: password,
        id_picture: idPicture,          // Base64 encoded string
        profile_picture: profilePicture, // Base64 encoded string
        selfie_with_id: selfieWithID    // Base64 encoded string
    }

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }

    return fetch(API_URL, options)
        .then(response => response.json())
        .then(data => {
            console.log('Response', data)
            return data.id // Assuming the response contains the user ID
        })
        .catch(error => {
            console.error('Error:', error)
            throw error
        })
}

// Helper functions for validation
function validateAlphabetical(value) {
    return /^[a-zA-Z]+$/.test(value)
}

function validateCity(value) {
    return /^[a-zA-Z\s]+$/.test(value)
}

function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validateNumber(value) {
    return /^\d+$/.test(value)
}
