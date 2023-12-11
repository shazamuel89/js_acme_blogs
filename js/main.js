function createElemWithText(elementName = "p", textContent = "", className) {
    const element = document.createElement(elementName);
    element.textContent = textContent;
    if (className) {
        element.classList.add(className);
    }
    return element;
}

function createSelectOptions(usersJsonData) {
    if (!usersJsonData) {
        return undefined;
    }
    const optionElements = usersJsonData.map((user) => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        return option;
    });
    return optionElements;
}

function toggleCommentSection(postId) {
    if (!postId) {
        return undefined;
    }
    const section = document.querySelector(`section[data-post-id="${postId}"]`);
    if (section) {
        section.classList.toggle('hide');
    }
    return section;
}

function toggleCommentButton(postId) {
    if (!postId) {
        return undefined;
    }
    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    if (button) {
        button.textContent = button.textContent === "Show Comments" ? "Hide Comments" : "Show Comments";
    }
    return button;
}

function deleteChildElements(parentElement) {
    if (!(parentElement instanceof HTMLElement)) {
        return undefined;
    }
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
    return parentElement;
}

function addButtonListeners() {
    const buttons = document.querySelectorAll('main button');
    if (buttons) {
        buttons.forEach((button) => {
            const postId = button.dataset.postId;
            if (postId) {
                const clickHandler = function (event) {
                    toggleComments(event, postId);
                };
                button.addEventListener('click', clickHandler, false);
                button.clickHandler = clickHandler;
            }
        });
    }
    return buttons;
}

function removeButtonListeners() {
    const buttons = document.querySelectorAll('main button');
    if (buttons) {
        buttons.forEach((button) => {
            const postId = button.dataset.postId;
            if (postId) {
                button.removeEventListener('click', button.clickHandler, false);
                delete button.clickHandler;
            }
        });
    }
    return buttons;
}

function createComments(jsonCommentsData) {
    if (!jsonCommentsData) {
        return undefined;
    }
    const commentFragment = document.createDocumentFragment();
    jsonCommentsData.forEach((comment) => {
        const article = document.createElement('article');
        const name = createElemWithText('h3', comment.name);
        const body = createElemWithText('p', comment.body);
        const email = createElemWithText('p', `From: ${comment.email}`);
        article.append(name, body, email);
        commentFragment.append(article);
    });
    return commentFragment;
}

function populateSelectMenu(usersJsonData) {
    if (!usersJsonData) {
        return undefined;
    }
    const selectMenu = document.querySelector('#selectMenu');
    const options = createSelectOptions(usersJsonData);
    options.forEach((option) => {
        selectMenu.append(option);
    });
    return selectMenu;
}

async function getUsers() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        if (!response.ok) {
            throw new Error("Status code not in 200-299 range");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function getUserPosts(userId) {
    if (!userId) {
        return undefined;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        if (!response.ok) {
            throw new Error("Status code not in 200-299 range");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function getUser(userId) {
    if (!userId) {
        return undefined;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        if (!response.ok) {
            throw new Error("Status code not in 200-299 range");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function getPostComments(postId) {
    if (!postId) {
        return undefined;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        if (!response.ok) {
            throw new Error("Status code not in 200-299 range");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}

async function displayComments(postId) {
    if (!postId) {
        return undefined;
    }
    const section = document.createElement('section');
    section.dataset.postId = postId;
    section.classList.add('comments', 'hide');
    const comments = await getPostComments(postId);
    const fragment = createComments(comments);
    section.append(fragment);
    return section;
}

async function createPosts(postsJsonData) {
    if (!postsJsonData) {
        return undefined;
    }
    const fragment = document.createDocumentFragment();
    for (const post of postsJsonData) {
        const article = document.createElement('article');
        const title = createElemWithText('h2', post.title);
        const body = createElemWithText('p', post.body);
        const id = createElemWithText('p', `Post ID: ${post.id}`);
        const author = await getUser(post.userId);
        const nameAndCompany = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        const companyCatchPhrase = createElemWithText('p', author.company.catchPhrase);
        const showCommentsButton = createElemWithText('button', 'Show Comments');
        showCommentsButton.dataset.postId = post.id;
        article.append(title, body, id, nameAndCompany, companyCatchPhrase, showCommentsButton);
        const section = await displayComments(post.id);
        article.append(section);
        fragment.append(article);
    }
    return fragment;
}

async function displayPosts(postsData) {
    const main = document.querySelector('main');
    const element = postsData ? await createPosts(postsData) : createElemWithText('p', 'Select an Employee to display their posts.', 'default-text');
    main.append(element);
    return element;
}

function toggleComments(event, postId) {
    if (!event || !postId) {
        return undefined;
    }
    event.target.listener = true;
    const section = toggleCommentSection(postId);
    const button = toggleCommentButton(postId);
    return [section, button];
}

async function refreshPosts(postsJsonData) {
    if (!postsJsonData) {
        return undefined;
    }
    const removeButtons = removeButtonListeners();
    const main = deleteChildElements(document.querySelector('main'));
    const fragment = await displayPosts(postsJsonData);
    const addButtons = addButtonListeners();
    return [removeButtons, main, fragment, addButtons];
}

async function selectMenuChangeEventHandler(event) {
    if (event?.type !== 'change') {
        return undefined;
    }
    const selectMenu = document.querySelector('#selectMenu');
    selectMenu.disabled = true;
    const userId = event.target?.value || 1;
    const postsJsonData = await getUserPosts(userId);
    const refreshPostsArray = await refreshPosts(postsJsonData);
    selectMenu.disabled = false;
    return [userId, postsJsonData, refreshPostsArray];
}

async function initPage() {
    const usersJsonData = await getUsers();
    const select = populateSelectMenu(usersJsonData);
    return [usersJsonData, select];
}

function initApp() {
    initPage();
    const selectMenu = document.querySelector('#selectMenu');
    selectMenu.addEventListener('change', selectMenuChangeEventHandler);
}

document.addEventListener('DOMContentLoaded', initApp);