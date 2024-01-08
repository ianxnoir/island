

const editButtons = document.querySelectorAll(".choose")
    for (const button1 of editButtons) {


        button1.addEventListener("click", async () => {
            
            const res = await fetch("/icon/" + button1.dataset.id, {
                method: 'PUT'
            })
            const json = await res.json();
            if(json.result){
            
                alert('Welcome, new Islander!')
                location.href = 'homepage.html';
            }

        })
    }
