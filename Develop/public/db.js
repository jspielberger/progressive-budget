let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {

    const updatedDB = event.target.result;
    updatedDB.createObjectStore("pending", { autoIncrement: ture });

};


//update the request after connection

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        updateDatabase();
    }
}

request.onerror = function(event) {
    console.log("Error: " + event.target.errorCode);
};

//saveRecord function! you need it! 
function saveRecord(data) {

    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");

    pendingStore.add(data);

}

function updateDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");

    const pendingStore = transaction.objectStore("pending");

    const getAll = pendingStore.getAll();

    getAll.onsuccess = function() {

        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {

                const transaction = db.transaction(["pending"], "readwrite");
                
                const pendingStore = transaction.objectStore("pending");

                //gots to clear it all up
                pendingStore.clear();

                ///then you gotta reload it
                location.reload();

            });

        }


    }

}

