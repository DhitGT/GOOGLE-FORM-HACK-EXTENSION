function getSoal() {
    console.log("Fetching questions...");

    // Select all div elements with data-params attribute
    let divElements = document.querySelectorAll('div[data-params]');

    // Array to store data-params values
    let dataParamsArray = [];
    let dataParamsOptionsArray = [];
    let question = null;
    let option = null;

    // Iterate through each div element
    divElements.forEach((divElement) => {
        // Get the value of the data-params attribute
        let dataParams = divElement.getAttribute('data-params');
        question = extractQuestionFromDataParams(dataParams)
        option = extractOptionsFromDataParams(dataParams)
        console.log("question : ", question)
        console.log("option : ", option)
        dataParamsArray.push(question);
        dataParamsOptionsArray.push(option);
    });

    // Log the array containing all data-params values
    console.log("dataParamsArray:", dataParamsArray);
    console.log("dataParamsOptionsArray:", dataParamsOptionsArray);

    const data = {
        questions: dataParamsArray,
        options: dataParamsOptionsArray
    }


    // Return the questions array
    return data;
}

function extractQuestionFromDataParams(dataParams) {
    // Function to decode HTML entities in the string
    function decodeHtmlEntities(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

    // Replace HTML entities to convert the string to valid JSON-like structure
    dataParams = dataParams.replace(/&quot;/g, '"');
    dataParams = decodeHtmlEntities(dataParams);

    // Extract the question text manually
    // Assuming the question text is enclosed in quotes and follows a pattern in your dataParams string
    let questionRegex = /"([^"]+)"/; // Regex to match text within double quotes
    let match = dataParams.match(questionRegex);
    let question = match ? match[1] : '';

    return question;
}

function extractOptionsFromDataParams(dataParams) {
    // Function to decode HTML entities in the string
    function decodeHtmlEntities(input) {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

    // Replace HTML entities to convert the string to a manageable format
    dataParams = dataParams.replace(/&quot;/g, '"');
    dataParams = decodeHtmlEntities(dataParams);

    // Initialize an array to store options
    let options = [];

    // Regular expression to match options within the nested arrays
    let regex = /\["([^"]+)",null,null,null,false\]/g;
    let match;

    // Match all occurrences of the regex in the dataParams string
    while ((match = regex.exec(dataParams)) !== null) {
        options.push(match[1]); // Extract the option text from the matched group
    }

    // Generate labels dynamically (e.g., A, B, C, ..., Z, AA, AB, etc.)
    const generateLabel = index => {
        let label = '';
        while (index >= 0) {
            label = String.fromCharCode((index % 26) + 65) + label;
            index = Math.floor(index / 26) - 1;
        }
        return label;
    };

    // Add labels to the options
    options = options.map((option, index) => `${generateLabel(index)}. ${option}`);

    return options;
}



function selectAnswer(answer) {
    // Find the radio button element with the specified data-value
    const radioButton = document.querySelector(`[data-value="${answer}"]`);

    console.log("checked answer : ", answer)
    // If the element is found, set its aria-checked attribute to true
    if (radioButton) {
        radioButton.setAttribute('aria-checked', 'true');
        const span = radioButton.closest('label').querySelector('span');
        if (span) {
            span.style.fontWeight = 'bold';
        }
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getSoal") {
        const questionDetails = getSoal();
        if (questionDetails) {
            chrome.runtime.sendMessage({ action: "getSoal", value: questionDetails });
        }
    } else if (request.action === "selectAnswer") {
        selectAnswer(request.answer);
    }
});
