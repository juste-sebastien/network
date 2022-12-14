import { loadPage, followUnfollow, loadProfile, editPost, saveEditedPost, addRemoveLike } from './main.js';
import { convertTime } from './utils.js';


// Define all variables needed
const profile = document.querySelector('#profile-container');
const profileTitle = document.querySelector('#profile-name');
const profileDate = document.querySelector('#profile-date');
const profilePosts = document.querySelector('#profile-total-posts');
const profileFollowers = document.querySelector('#profile-followers');
const profileImage = document.querySelector('#profile-image');
const profilePanel = document.querySelector('#profile-follow-panel');


export function generateOnePost(post, request_user = '') {
    // Create one div per post
    let postDiv = document.createElement('div');
    postDiv.className = 'd-flex flex-row mb-2';

    // Add img
    let image = document.createElement('img');
    image.src = post.user_profile_img;
    image.className = 'col-1 me-1';
    postDiv.appendChild(image);

    // Create a sub-div to insert content of post and author's name
    let subDiv1 = document.createElement('div');
    let title = document.createElement('h5');
    title.textContent = post.username;
    title.style.cursor = 'pointer';
    title.addEventListener('click', function() {
        loadPage('profile', post.username);
    })
    subDiv1.appendChild(title);
    // Display content
    let content = document.createElement('p');
    content.textContent = post.content;
    subDiv1.appendChild(content);
    // Display content only for modify it
    let editZone = document.createElement('textarea');
    editZone.style.display = 'none';
    editZone.className = 'form-control';
    subDiv1.appendChild(editZone);
    subDiv1.className = 'flex-grow-1 ms-1';
    postDiv.appendChild(subDiv1);

    // Create sub-div if user is author
    if (post.username === request_user) {
        let subDiv3 = document.createElement('div');
        let editButton = generateSaveEditButton(content, editZone, 'edit');
        let saveButton = generateSaveEditButton(content, editZone, 'save');
        editButton.addEventListener('click', function() {
            editPost(content, editZone, editButton, saveButton);
        })
        saveButton.addEventListener('click', function() {
            saveEditedPost(content, editZone, editButton, saveButton, post);
        })
        subDiv3.appendChild(editButton);
        subDiv3.appendChild(saveButton);
        subDiv3.className = 'align-self-center p-1 m-1';
        postDiv.appendChild(subDiv3);
    }

    // Create a sub-div to display time and like
    let subDiv2 = document.createElement('div');
    let time = document.createElement('p');
    time.textContent = convertTime(post.since);
    subDiv2.appendChild(time);

    let likeZone = document.createElement('p');
    let heart = document.createElement('span');
    heart.style.cursor = 'pointer';
    heart.textContent = post.is_liker ? '???' : '???';
    let counter = document.createElement('span');
    counter.textContent = post.like;
    heart.addEventListener('click', function() {
        counter.textContent = addRemoveLike(counter, heart, post)
    })
    likeZone.appendChild(heart);
    likeZone.appendChild(counter);

    subDiv2.appendChild(likeZone);
    postDiv.appendChild(subDiv2);
    
    return postDiv;
}

export function generateUserProfile(user) {
    profileTitle.textContent = user.username;
    profileImage.src = user.img_profile;
    profilePosts.textContent = user.total_posts;
    profileDate.textContent = convertTime(user.since);
    profileFollowers.textContent = user.total_followers;
    profilePanel.innerHTML = '';
    const profileFollowButton = generateFollowButton(user);
    profileFollowButton.addEventListener('click', () => {
        followUnfollow(user);
        })
    profilePanel.appendChild(profileFollowButton);
}

function generateFollowButton(user) {
    const button = document.createElement('button');
    button.id = 'profile-follow-button';
    if (!user.is_followed && !user.is_request_user && user.is_authenticated) {
        button.textContent = 'Follow';
    } else if (user.is_followed && !user.is_request_user && user.is_authenticated) {
        button.textContent = 'Unfollow';
    } else {
        button.style.display = 'none';
    };
    button.className = 'btn btn-primary';
    return button;
}


function generateSaveEditButton(content, zone, functionalitie) {
    let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'btn btn-primary';
    let saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.display = 'none';
    saveButton.className = 'btn btn-primary';

    if (functionalitie === 'edit') {
        return editButton;
    } else {
        return saveButton;
    }
    
}