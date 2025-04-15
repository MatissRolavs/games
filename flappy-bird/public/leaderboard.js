fetch("get_leaderboard.php")
    .then(response => response.json())
    .then(players => {
        const container = document.getElementById("scores-container");

        if (players.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No scores yet! Be the first to play!</p>';
        } else {
            let html = "";
            players.forEach((player, index) => {
                html += `
                    <div class="score-entry ${index < 3 ? 'top-three' : ''}">
                        <span class="rank font-bold">${index + 1}.</span>
                        <span class="name ml-4">${player.name}</span>
                        <span class="score ml-auto font-bold">${player.score}</span>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
    })
    .catch(error => {
        console.error("Error fetching leaderboard:", error);
        document.getElementById("scores-container").innerHTML = 
            '<p class="text-red-500">Error loading leaderboard. Please try again later.</p>';
    });
