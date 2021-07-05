const { User, Thought } = require('../models');

const userController = {
    getAllUsers(req, res) {
        User.find({})
        .populate({
            path: 'thoughts',
            select: '-__v -username'
        })
        .populate({
            path: 'friends',
            select: '-__v -thoughts'
        })
        .select('-__v')
        .then(dbUser => res.json(dbUser))
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    },

    getUserById({ params }, res) {
        User.findOne({ _id: params.userId })
        .populate({
            path: 'thoughts',
            select: '-__v -username'
        })
        .populate({
            path: 'freinds',
            select: '-__v -thoughts'
        })
        .select('-__v')
        .then(dbUser => {
            if (!dbUser) {
                res.status(404).json({ message: 'No user found with this id! '});
                return;
            }
            res.json(dbUser);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    },

    createUser({ body }, res) {
        User.create(body)
        .then(dbUser => res.json(dbUser))
        .catch(err => res.status(400).json(err));
    },

    updateUser({ params, body }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            body,
            { new:true, runValidators: true }
        )
        .then(dbUser => {
            if (!dbUser) {
                res.status(404).json({ message: 'No user found with this id!' });
                return;
            }
            res.json(dbUser);
        })
        .catch(err => res.status(400).json(err));
    },

    deleteUser({ params }, res) {
        User.findOneAndDelete({ _id: params.userId })
        .then(dbUser => {
            if(!dbUser) {
                res.status(400).json({ message: 'No user with this id found!'});
                return;
            }
            res.json(dbUser);
        })
        .then(dbUser => {
            User.updateMany(
                { id: { $in: dbUser.friends } },
                { $pull: { friends: params.userId } }
            )
            .then(() => {
                Thought.deleteMany({ username: dbUser.username })
                .then(() => {
                    res.json({ message: 'Deleted user!' })
                })
                .catch(err => res.status(400).json(err));
            })
            .catch(err => res.status(400).json(err));
        })
        .catch(err => res.status(400).json(err));
    },

    addFriend({ params }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            {$addToSet: { friends: params.friendId } },
            { new: true, runValidators: true }
        )
        .then(dbUser => {
            if(!dbUser) {
                res.status(404).json({ message: 'No user found with this id!' });
                return;
            }
            res.json(dbUser);
        })
        .catch(err => res.status(400).json(err));
    },

    deleteFriend({ params }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            {$pull: { friends: params.friendId } },
            { new: true }
        )
        .then(dbUser => {
            if(!dbUser) {
                res.status(404).json({ message: 'No user found with this id! '});
                return;
            }
            res.json(dbUser);
        })
        .catch(err => res.status(400).json(err));
    }
};

module.exports = userController;