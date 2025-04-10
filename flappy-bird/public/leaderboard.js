fetch("/leaderboard")
  .then(res => res.json())
  .then(data => {
    const podium = document.getElementById("podium");
    data.forEach((player, index) => {
      podium.innerHTML += `
        <div style="margin: 10px;">
          <h2>#${index + 1}</h2>
          <p><strong>${player.name}</strong>: ${player.score}</p>
        </div>
      `;
    });
  });
