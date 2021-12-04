const deleteAtFromUsername = (usernameWithAt) => {
    return (usernameWithAt.charAt(0).includes('@')) ? usernameWithAt.slice(1) : usernameWithAt;
};

module.exports = {deleteAtFromUsername};