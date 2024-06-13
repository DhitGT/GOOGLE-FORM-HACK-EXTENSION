document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("get-jawaban");
    button.addEventListener("click", function () {
        console.log("Generating...")
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getSoal" });
        });

    });
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function extractText(response) {
    let match = response.match(/#(.*?)#/);

    // Extract and print the result if a match is found
    let result = null;
    if (match) {
        result = match[1];

    } else {
        console.log("No match found");
    }
    return result

}
const questionContainer = document.getElementById("question-container");
questionContainer.innerHTML = " ";
const answerContainer = document.getElementById("answer-container");
answerContainer.innerHTML = " ";
const radioLabelsList = document.getElementById("radio-labels-list");
radioLabelsList.innerHTML = " ";

const processQuestions = async (questions, options) => {
    for (let index = 0; index < questions.length; index++) {
        const item = questions[index];

        radioLabelsList.innerHTML = " ";
        const questionTextElement = document.createElement("p");
        const answerText = document.createElement("p");
        questionContainer.innerHTML = " ";
        questionTextElement.innerText = item;
        questionTextElement.classList.add("font-bold", "mb-3");
        questionContainer.appendChild(questionTextElement);

        if (options[index]) {
            const optionss = options[index];
            optionss.forEach((label, I) => {
                const listItem = document.createElement("li");
                listItem.innerText = `${label}`;
                radioLabelsList.appendChild(listItem);
            });
        }

        const payloadJawaban = {
            "messages": [
                {
                    "id": "QBYV0he",
                    "content": `if I give you this kind of question ${item}. Choose the only one answer response the only one answer ${options[index].join(' ')} and I need you to respond with only the right answer like
'Gaya dada'

just respond like that
wrap the answer exactly like this '#{[the correct answer]}#'

this is the question ${item} and here are the options ${options[index].join(' ')} . WITHOUT THE EXPLANATION AND ANSWER THE OPTION TEXT WITHOUT A,B,C,D ECT JUST THE OPTION TEXT
`,
                    "role": "user"
                }
            ],
            "id": "SivX7vK",
            "previewToken": null,
            "userId": "a040eed4-fb5e-420d-b73e-5441eecac0f2",
            "codeModelMode": true,
            "agentMode": {},
            "trendingAgentMode": {},
            "isMicMode": false,
            "isChromeExt": false,
            "githubToken": null
        };

        try {
            console.log("Getting The Answer ..");
            const response = await fetch("https://blackbox.ai/api/chat", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payloadJawaban)
            });

            const responseData = await response.text();

            answerContainer.innerHTML = " ";
            answerText.innerText = "Answer : " + extractText(responseData);
            answerContainer.appendChild(answerText);
            answerText.classList.add("mt-6");
            console.log('Success Get The Answer: ', extractText(responseData));

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "selectAnswer", answer: extractText(responseData) });
            });

        } catch (error) {
            console.error('Error:', error);
        }

        // Introduce a 500 ms delay before processing the next question
        await delay(500);
    }
};

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {



    if (request.action === "getSoal") {
        const data = request.value

        if (data.questions && data.options) {


            processQuestions(data.questions, data.options)


        }



    }
});
