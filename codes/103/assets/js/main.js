const tracks = document.querySelectorAll(".carousel__content");

tracks.forEach((track) => {
  const cards = [...track.children];
  for (const card of cards) {
    track.appendChild(card.cloneNode(true));
  }
});
