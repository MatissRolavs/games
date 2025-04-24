document.addEventListener('DOMContentLoaded', () => {
  const difficultySelect = document.getElementById('difficulty-select');
  const savedDifficulty = localStorage.getItem('selectedDifficulty') || 'Normal';
  difficultySelect.value = savedDifficulty;
  
  difficultySelect.addEventListener('change', updateLeaderboard);
  updateLeaderboard();
});

function updateLeaderboard() {
  const difficultySelect = document.getElementById('difficulty-select');
  const selectedDifficulty = difficultySelect.value;
  localStorage.setItem('selectedDifficulty', selectedDifficulty);
  
  fetch(`get_leaderboard.php?difficulty=${encodeURIComponent(selectedDifficulty)}`)
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector("#leaderboard-table tbody");
      tbody.innerHTML = "";
      data.forEach((entry, index) => {
        const tr = document.createElement("tr");

        const rankTd = document.createElement("td");
        rankTd.textContent = index + 1;

        const usernameTd = document.createElement("td");
        usernameTd.textContent = entry.username;

        const timeTd = document.createElement("td");
        timeTd.textContent = (entry.time / 1000).toFixed(2);

        const dateTd = document.createElement("td");
        dateTd.textContent = new Date(entry.created_at).toLocaleString();

        tr.appendChild(rankTd);
        tr.appendChild(usernameTd);
        tr.appendChild(timeTd);
        tr.appendChild(dateTd);
        tbody.appendChild(tr);
      });
    })
    .catch(error => console.error("Error fetching leaderboard: ", error));
}
