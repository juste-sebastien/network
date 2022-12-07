import { loadPage, followUnfollow, loadProfile } from './main.js';
import { convertTime } from './utils.js';


// Define all variables needed
const profile = document.querySelector('#profile-container');
const profileTitle = document.querySelector('#profile-name');
const profileDate = document.querySelector('#profile-date');
const profilePosts = document.querySelector('#profile-total-posts');
const profileFollowers = document.querySelector('#profile-followers');
const profileImage = document.querySelector('#profile-image');
const profilePanel = document.querySelector('#profile-follow-panel');

export function generateEditButton() {
    const button = document.createElement('button');
    button.type = "button";
    button.className = "d-inline-block float-right edit-btn btn btn-secondary";
    button.innerHTML = "Edit";
    return button;
}

export function generateLikeButton(label, count) {
    const button = document.createElement('button');
    button.type = "button";
    button.className = `${label}-btn`;
    button.innerHTML = `&#10084`;

    const likeCounter = document.createElement('span');
    likeCounter.className = `counter-txt`
    likeCounter.innerHTML = `${count}`

    const likeDiv = document.createElement('div');
    likeDiv.className = "d-inline-block"
    likeDiv.appendChild(button);
    button.appendChild(likeCounter);
    return likeDiv;
}

export function generatePost(context) {
    const post = document.createElement('div');
    post.className = "post card";
    post.id = `${context.post.id}`;
    post.innerHTML = `
        <div class="post-body card-body px-4 py-2">
        <h3 class="post-title card-title">${context.post.author}</h3>
        <h6 class="card-subtitle mb-2 text-muted">${context.post.timestamp}</h6>
        <p class="card-text">${context.post.message}</p>
        <textarea class="card-text-editor form-control" style="display:none"></textarea>
        </div>
    `

    return post;
}

export function generateProfile(contents) {
    const profile = document.createElement('div');
    profile.innerHTML = `
        <h1 id="profile-div-title">${contents.username}</h1>
        <span class="text-muted">Joined ${contents.join_date}</span>
        <ul id="profile-stats-list">
        <li>
            <div>
            <h6>Posts</h6> ${contents.post_count}
            </div>
        </li>
        <li>
            <div>
            <h6>Following</h6>
            ${contents.following}
            </div>
        </li>
        <li>
            <div>
            <h6>Followers</h6> 
            ${contents.followed_by}
            </div>
        </li>
        </ul>
        
    `;

    // only add follow button user is signed in and is not the owner of the profile
    if (contents.requested_by && contents.requested_by !== contents.username) {
        const followButton = document.createElement('button');
        followButton.innerHTML = contents['is_followed'] ? 'Unfollow' : 'Follow';
        followButton.id = "follow-button";
        followButton.className = "button btn btn-primary";
        profile.appendChild(followButton);
    }

    return profile;
}


export function generateOnePost(post) {
    let postDiv = document.createElement('div');

    let image = document.createElement('img');
    image.src = post.user_profile_img;
    postDiv.appendChild(image);

    let subDiv1 = document.createElement('div');
    let title = document.createElement('h5');
    title.textContent = post.username;
    title.style.cursor = 'pointer';
    title.addEventListener('click', function() {
        loadPage('profile', post.username);
    })
    subDiv1.appendChild(title);
    let content = document.createElement('p');
    content.textContent = post.content;
    subDiv1.appendChild(content);
    postDiv.appendChild(subDiv1);

    let subDiv2 = document.createElement('div');
    let time = document.createElement('p');
    time.textContent = post.timestamp;
    subDiv2.appendChild(time);

    let likeZone = document.createElement('p');
    let heart = document.createElement('span');
    heart.style.cursor = 'pointer';
    heart.textContent = '♡';
    heart.addEventListener('click', function() {
        heart.textContent = '❤' ? '♡' : '❤';
    })
    likeZone.appendChild(heart);
    let counter = document.createElement('span');
    counter.textContent = post.like;
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
        loadProfile(user.username);
        })
    profilePanel.appendChild(profileFollowButton);
}

function generateFollowButton(user) {
    const button = document.createElement('button');
    button.id = 'profile-follow-button';
    console.log('in generateFollowButton', user);
    if (!user.is_followed && !user.is_request_user && user.is_authenticated) {
        button.textContent = 'Follow';
    } else if (user.is_followed && !user.is_request_user && user.is_authenticated) {
        button.textContent = 'Unfollow';
    } else {
        button.style.display = 'none';
    };
    return button;
}