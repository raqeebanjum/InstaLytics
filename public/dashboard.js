// Function to fetch and display the saved data from Realm
const displayData = () => {
    // Open Realm database
    const Realm = require('realm');
  
    const realm = new Realm({
      path: 'data/user_data.realm' // Ensure this matches the path where the realm is stored
    });
  
    const user = realm.objects('User')[0]; // Assuming there's only one user for now
  
    // Display followers
    const followersContainer = document.getElementById('dataContainer');
    followersContainer.innerHTML += '<h2 class="text-2xl font-bold">Followers:</h2>';
    
    user.followers.forEach(follower => {
      followersContainer.innerHTML += `
        <div>
          <a href="${follower.href}" target="_blank" class="text-blue-400">${follower.username}</a>
        </div>`;
    });
  
    // Display followings
    followersContainer.innerHTML += '<h2 class="text-2xl font-bold mt-4">Followings:</h2>';
    
    user.followings.forEach(following => {
      followersContainer.innerHTML += `
        <div>
          <a href="${following.href}" target="_blank" class="text-blue-400">${following.username}</a>
        </div>`;
    });
  
    // Display users that are being followed but not following back
    const notFollowingBack = user.followings.filter(following => 
      !user.followers.some(follower => follower.username === following.username)
    );
  
    followersContainer.innerHTML += '<h2 class="text-2xl font-bold mt-4">Not Following Back:</h2>';
    
    if (notFollowingBack.length === 0) {
      followersContainer.innerHTML += '<div>No users are being followed who are not following back.</div>';
    } else {
      notFollowingBack.forEach(userNotFollowingBack => {
        followersContainer.innerHTML += `
          <div>
            <a href="${userNotFollowingBack.href}" target="_blank" class="text-red-400">${userNotFollowingBack.username}</a>
          </div>`;
      });
    }
  };
  
  // Load the data when the page loads
  window.onload = displayData;
  
  // Back button functionality
  document.getElementById('backButton').onclick = () => {
    window.location.href = 'index.html';  // Redirect back to the upload page
  };