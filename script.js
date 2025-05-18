
const LOCAL_API_URL = 'http://localhost:3001/api/restaurants';

fetch(LOCAL_API_URL)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("restaurant-list");
    container.innerHTML = "";

    data.forEach(place => {
      console.log("ID for", place.name, "is", place.id);
      const div = document.createElement("div");
      div.className = "restaurant";
      div.innerHTML = `
        <h2>${place.name}</h2>
        ${place.image ? `<img src="${place.image}" alt="${place.name}">` : ""}
        <p><strong>Address:</strong> ${place.address}</p>
        <p><strong>Category:</strong> ${place.category}</p>
        <p><strong>Likes:</strong> <span id="likes-${place.id}">${place.likes || 0}</span></p>
        <button onclick="likeRestaurant(${place.id})">❤️ Like</button>
        <p style="font-size: 0.9em; color: red;">🔹 From You</p>

        <div class="comments" id="comments-${place.id}">
          <form onsubmit="submitComment(event, ${place.id})">
            <input type="text" placeholder="Your name" required id="user-${place.id}">
            <input type="text" placeholder="Write a comment..." required id="comment-${place.id}">
            <input type="file" accept="image/*" id="comment-image-${place.id}">
            <button type="submit">💬 Post</button>
          </form>
          <div class="comment-list" id="comment-list-${place.id}">Loading comments...</div>
        </div>
      `;

      loadComments(place.id);
      container.appendChild(div);
    });
  })
  .catch(err => {
    console.error("Error fetching restaurants:", err);
    document.getElementById("restaurant-list").innerText = "Failed to load restaurants.";
  });

function likeRestaurant(id) {
  fetch(`http://localhost:3001/api/restaurants/${id}/like`, {
    method: 'PATCH'
  })
  .then(res => res.json())
  .then(() => {
    const likeEl = document.getElementById(`likes-${id}`);
    likeEl.textContent = parseInt(likeEl.textContent) + 1;
  });
}

function submitComment(e, restaurantId) {
  e.preventDefault();

  const user = document.getElementById(`user-${restaurantId}`).value;
  const comment = document.getElementById(`comment-${restaurantId}`).value;
  const fileInput = document.getElementById(`comment-image-${restaurantId}`);
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onloadend = function () {
      const base64Image = reader.result;
      sendComment(restaurantId, user, comment, base64Image);
    };
    reader.readAsDataURL(file);
  } else {
    sendComment(restaurantId, user, comment, null);
  }
}

function sendComment(restaurantId, user, comment, image) {
  fetch(`http://localhost:3001/api/restaurants/${restaurantId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, comment, image })
  })
  .then(res => res.json())
  .then(() => {
    document.getElementById(`user-${restaurantId}`).value = '';
    document.getElementById(`comment-${restaurantId}`).value = '';
    document.getElementById(`comment-image-${restaurantId}`).value = '';
    loadComments(restaurantId);
  });
}

function loadComments(restaurantId) {
  fetch(`http://localhost:3001/api/restaurants/${restaurantId}/comments`)
    .then(res => res.json())
    .then(data => {
      const commentList = document.getElementById(`comment-list-${restaurantId}`);
      commentList.innerHTML = "";
      data.forEach(c => {
        commentList.innerHTML += `
          <div class="comment">
            <p><strong>${c.user}</strong>: ${c.comment}</p>
            ${c.image ? `<img src="${c.image}" alt="Comment image" style="max-width: 100%; border-radius: 6px;">` : ""}
          </div>
        `;
      });
    });
}

document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const category = document.getElementById("category").value.trim();
  const image = document.getElementById("image").value.trim();

  const res = await fetch('http://localhost:3001/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, address, category, image })
  });

  if (res.ok) {
    alert("Restaurant added!");
    location.reload();
  } else {
    alert("Error adding restaurant.");
  }
});
