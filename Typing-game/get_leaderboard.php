<?php
header('Content-Type: application/json');
include 'db.php';

$difficulty = isset($_GET['difficulty']) ? $_GET['difficulty'] : 'Normal';

$stmt = $conn->prepare("SELECT * FROM leaderboard WHERE difficulty = ? ORDER BY time ASC LIMIT 10");
$stmt->bind_param("s", $difficulty);
$stmt->execute();
$result = $stmt->get_result();

$leaderboard = [];
while ($row = $result->fetch_assoc()) {
  $leaderboard[] = $row;
}

echo json_encode($leaderboard);

$stmt->close();
$conn->close();
?>
