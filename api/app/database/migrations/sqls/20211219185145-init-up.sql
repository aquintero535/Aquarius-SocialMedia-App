/* Replace with your SQL commands */

DROP TABLE IF EXISTS `users_follows`;
CREATE TABLE `users_follows`(
    `follow_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `profile_id_one` INT NOT NULL,
    `profile_id_two` INT NOT NULL 
);

DROP TABLE IF EXISTS `reposts`;
CREATE TABLE `reposts`(
  `repost_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `profile_id` INT NOT NULL,
  `post_id` CHAR(16) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  UNIQUE `unique_index_repost`(`profile_id`, `post_id`)
);

DROP TABLE IF EXISTS `posts_likes`;
CREATE TABLE `posts_likes`(
    `like_id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `profile_id` INT NOT NULL,
    `post_id` CHAR(16) NOT NULL,
    UNIQUE `unique_index_like`(`profile_id`, `post_id`)
);

DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts`(
    `post_id` CHAR(16) NOT NULL PRIMARY KEY,
    `profile_id` INT NOT NULL,
    `body` TEXT,
    `comments` INT UNSIGNED NOT NULL DEFAULT 0,
    `likes` INT UNSIGNED NOT NULL DEFAULT 0,
    `reposts` INT UNSIGNED NOT NULL DEFAULT 0,
    `replies` INT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `reply_to` CHAR(16)
);

DROP TABLE IF EXISTS `users_profiles`;
CREATE TABLE `users_profiles`(
    `profile_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNIQUE NOT NULL,
    `profile_image` VARCHAR(150) NOT NULL DEFAULT '/files/default-profile-image.jpg',
    `profile_header` VARCHAR(150) NOT NULL DEFAULT '/files/default-header.jpg',
    `profile_name` VARCHAR(40) NOT NULL DEFAULT 'New user',
    `profile_bio` VARCHAR(500) NOT NULL DEFAULT '',
    `username` VARCHAR(20) UNIQUE NOT NULL,
    `followers` INT UNSIGNED NOT NULL DEFAULT 0,
    `following` INT UNSIGNED NOT NULL DEFAULT 0
);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`(
    `user_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(50) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `birthday` DATE NOT NULL,
    `gender` CHAR(1) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE `users_profiles`
    ADD FOREIGN KEY(user_id) REFERENCES users(user_id) 
        ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `users_follows`
    ADD FOREIGN KEY(profile_id_one) REFERENCES users_profiles(profile_id)
        ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `posts`
    ADD FOREIGN KEY(profile_id) REFERENCES users_profiles(profile_id)
        ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `posts_likes`
    ADD FOREIGN KEY(profile_id) REFERENCES users_profiles(profile_id) 
        ON UPDATE CASCADE ON DELETE CASCADE,
    ADD FOREIGN KEY(post_id) REFERENCES posts(post_id) 
        ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE `reposts`
    ADD FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD FOREIGN KEY (`profile_id`) REFERENCES `users_profiles` (`profile_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE;

DROP TRIGGER IF EXISTS newLike;
CREATE TRIGGER newLike 
AFTER INSERT ON `posts_likes`
FOR EACH ROW
    UPDATE `posts` SET likes=likes+1 WHERE post_id=NEW.post_id;

DROP TRIGGER IF EXISTS deleteLike;
CREATE TRIGGER deleteLike
AFTER DELETE ON `posts_likes`
FOR EACH ROW
    UPDATE `posts` SET likes=likes-1 WHERE post_id=OLD.post_id;

DROP TRIGGER IF EXISTS newRepost;
CREATE TRIGGER newRepost 
AFTER INSERT ON `reposts`
FOR EACH ROW
    UPDATE `posts` SET reposts=reposts+1 WHERE post_id=NEW.post_id;

DROP TRIGGER IF EXISTS deleteRepost;
CREATE TRIGGER deleteRepost
AFTER DELETE ON `reposts`
FOR EACH ROW
    UPDATE `posts` SET reposts=reposts-1 WHERE post_id=OLD.post_id;

DROP TRIGGER IF EXISTS newFollow;
DROP TRIGGER IF EXISTS deleteFollow;
DROP PROCEDURE IF EXISTS newReply;
DROP PROCEDURE IF EXISTS deleteReply;

CREATE TRIGGER newFollow 
AFTER INSERT ON `users_follows`
FOR EACH ROW
BEGIN
	UPDATE `users_profiles` SET following=following+1 WHERE profile_id=NEW.profile_id_one;
    UPDATE `users_profiles` SET followers=followers+1 WHERE profile_id=NEW.profile_id_two;
END; 

CREATE TRIGGER deleteFollow
AFTER DELETE ON `users_follows`
FOR EACH ROW
BEGIN
	UPDATE `users_profiles` SET following=following-1 WHERE profile_id=OLD.profile_id_one;
    UPDATE `users_profiles` SET followers=followers-1 WHERE profile_id=OLD.profile_id_two;
END;


CREATE PROCEDURE newReply 
(IN new_post_id CHAR(16), IN pr_id INT, IN post_body TEXT, IN replied_post_id CHAR(16))
BEGIN
	INSERT INTO posts SET post_id=new_post_id, profile_id=pr_id, body=post_body, reply_to=replied_post_id;
	UPDATE posts SET replies=replies+1 WHERE post_id=replied_post_id;
END;


CREATE PROCEDURE deleteReply 
(IN reply_id CHAR(16), IN replied_post_id CHAR(16))
BEGIN
	DELETE FROM posts WHERE post_id=reply_id;
	UPDATE posts SET replies=replies-1 WHERE post_id=replied_post_id;
END;

INSERT INTO users (email, password, birthday, gender) VALUES
('admin@aquarius.com', '$2b$10$NJLWyGPNfQgXu/J4V8AV0uTc1YNzRiBUp.MzqbzcKdWyIAiCp63Um', '2021-03-19', 'M'),
('user2@aquarius.com', '$2b$10$Ol28W4agMg3fXYQ.1zSQreCBwNG2HfZqjXGucoQp4aWqzlDSuR9kS', '2021-03-19', 'M'),
('user3@aquarius.com', '$2b$10$Ol28W4agMg3fXYQ.1zSQreCBwNG2HfZqjXGucoQp4aWqzlDSuR9kS', '2021-03-19', 'M'),
('user4@aquarius.com', '$2b$10$Ol28W4agMg3fXYQ.1zSQreCBwNG2HfZqjXGucoQp4aWqzlDSuR9kS', '2021-03-19', 'M'),
('user5@aquarius.com', '$2b$10$Ol28W4agMg3fXYQ.1zSQreCBwNG2HfZqjXGucoQp4aWqzlDSuR9kS', '2021-03-19', 'M'),
('user6@aquarius.com', '$2b$10$Ol28W4agMg3fXYQ.1zSQreCBwNG2HfZqjXGucoQp4aWqzlDSuR9kS', '2021-03-19', 'M'),
('user7@aquarius.com', '$2b$10$Ol28W4agMg3fXYQ.1zSQreCBwNG2HfZqjXGucoQp4aWqzlDSuR9kS', '2021-03-19', 'M'),
('user8@aquarius.com', '$2b$10$Ol28W4agMg3fXYQ.1zSQreCBwNG2HfZqjXGucoQp4aWqzlDSuR9kS', '2021-03-19', 'M');

INSERT INTO `users_profiles` (user_id, profile_name, username) VALUES
(1, 'Admin', 'admin'),
(2, 'User 2', 'user2'),
(3, 'User 3', 'user3'),
(4, 'User 4', 'user4'),
(5, 'User 5', 'user5'),
(6, 'User 6', 'user6'),
(7, 'User 7', 'user7'),
(8, 'User 8', 'user8');

#El usuario 2 sigue a los usuarios 3, 4, 5 y el usuario 3 sigue al usuario 2.
INSERT INTO `users_follows` (profile_id_one, profile_id_two) VALUES
(2, 3),
(2, 4),
(2, 5),
(3, 2);

INSERT INTO `posts` (post_id, profile_id, body) VALUES
    ('-3axFqZiei0lxxFH', 2, 'Post de prueba #1 usuario:2'),
    ('0k54VB_0aK8TZhAX', 2, 'Post de prueba #2 usuario:2'),
    ('YOQxJte9YYiWLTmf', 2, 'Post de prueba #3 usuario:2'),
    ('XTIpZfCLN_IBXkd0', 3, 'Post de prueba #1 usuario:3'),
    ('wLkBJaZQrQk9DvMN', 3, 'Post de prueba #2 usuario:3'),
    ('D4Uripbf1YlN8fTt', 4, 'Post de prueba #1 usuario:4'),
    ('az1lPzoeMZnj3t8T', 5, 'Post de prueba #1 usuario:5'),
    ('I9dIDlp3cjyRsK5R', 1, 'Post de prueba con respuestas.');
    

INSERT INTO `posts` (post_id, profile_id, body, reply_to) VALUES
    ('SRM2GqjWA1ZWrUTB', 2, 'Respondiendo al post del usuario Admin.', 'I9dIDlp3cjyRsK5R'),
    ('fs90OWuqe7umSzvh', 3, 'Respondiendo al post del usuario 2', 'SRM2GqjWA1ZWrUTB');

#Reposts
#Los usuarios 4,5,6 y 7 hacen repost al post de ID '0k54VB_0aK8TZhAX'.
INSERT INTO `reposts` (profile_id, post_id) VALUES
    (4, '0k54VB_0aK8TZhAX'),
    (5, '0k54VB_0aK8TZhAX'),
    (6, '0k54VB_0aK8TZhAX'),
    (7, '0k54VB_0aK8TZhAX');

#Los usuarios 3, 4, 5, 6, 7 dan like al post de ID: '-3axFqZiei0lxxFH'
INSERT INTO `posts_likes` (profile_id, post_id) VALUES
    (3, '-3axFqZiei0lxxFH'),
    (4, '-3axFqZiei0lxxFH'),
    (5, '-3axFqZiei0lxxFH'),
    (6, '-3axFqZiei0lxxFH'),
    (7, '-3axFqZiei0lxxFH');