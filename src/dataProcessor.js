console.log('dataProcessor.js loaded correctly');  // Confirm the script is loaded

const { ipcRenderer } = require('electron'); // Ensure this line is present
const fs = require('fs');
const path = require('path');
const Realm = require('realm');

// Define schemas for Realm
const FollowerSchema = {
  name: 'Follower',
  primaryKey: 'username',  // Use the username as the primary key
  properties: {
    username: 'string',    // The follower's username
    href: 'string'         // The URL to the follower's Instagram profile
  }
};

const FollowingSchema = {
  name: 'Following',
  primaryKey: 'username',  // Use the username as the primary key
  properties: {
    username: 'string',    // The following's username
    href: 'string'         // The URL to the following's Instagram profile
  }
};

const UserSchema = {
  name: 'User',
  primaryKey: 'user_id',  // Use the user's username as the primary key
  properties: {
    user_id: 'string',              // The Instagram username of the user
    followers: 'Follower[]',        // List of Follower objects
    followings: 'Following[]'       // List of Following objects
  }
};

// Function to save followers and following data into Realm
const saveToRealm = async (followersData, followingsData, user_id) => {
  const realm = await Realm.open({
    path: path.join(__dirname, '../data/user_data.realm'),  // Database stored in the root's 'data' folder
    schema: [UserSchema, FollowerSchema, FollowingSchema]   // Use the defined schemas
  });

  realm.write(() => {
    // Check if the user already exists
    const existingUser = realm.objectForPrimaryKey('User', user_id);

    if (existingUser) {
      // Update the existing user's followers and followings
      existingUser.followers = followersData.map(follower => ({
        username: follower.value,
        href: follower.href
      }));
      existingUser.followings = followingsData.map(following => ({
        username: following.value,
        href: following.href
      }));
    } else {
      // Create a new user
      realm.create('User', {
        user_id: user_id,  // Use the provided user ID (username)
        followers: followersData.map(follower => ({
          username: follower.value,
          href: follower.href
        })),
        followings: followingsData.map(following => ({
          username: following.value,
          href: following.href
        }))
      });
    }
  });

  console.log('Followers and Following data saved to Realm.');
};

// Process files from the selected folder
const processFiles = (folderPath) => {
  const followersFilePath = path.join(folderPath, 'followers.json');
  const followingsFilePath = path.join(folderPath, 'following.json');

  // Read and parse the JSON files
  const followersData = JSON.parse(fs.readFileSync(followersFilePath, 'utf8'));
  const followingsDataRaw = JSON.parse(fs.readFileSync(followingsFilePath, 'utf8'));

  // Extract the followings data from the relationships_following array
  const followingsData = followingsDataRaw.relationships_following.map(item => {
    return {
      href: item.string_list_data[0].href,
      value: item.string_list_data[0].value
    };
  });

  // Ensure followersData is parsed correctly
  const parsedFollowers = followersData.map(item => ({
    href: item.string_list_data[0].href,
    value: item.string_list_data[0].value
  }));

  // Save to Realm and redirect to the dashboard
  saveToRealm(parsedFollowers, followingsData, 'user123') 
    .then(() => {
      window.location.href = 'dashboard.html'; 
    });
};

document.getElementById('processButton').addEventListener('click', async () => {
  const folderPath = await ipcRenderer.invoke('select-folder');

  if (!folderPath) {
    alert('Please select a folder.');
    return;
  }

  processFiles(folderPath);
});