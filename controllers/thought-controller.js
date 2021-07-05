const { Thought, User } = require('../models');

const thoughtController = {
    getAllThought(req, res) {
        Thought.find({})
        // .populate({
        //     path: 'reactions',
        //     select: '-__v'
        // })
        .select('-__v')
        .sort({_id: -1})
        .then(dbThought => res.json(dbThought))
        .catch(err => {
            res.status(400).json(err);
        });
    },

    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.thoughtId })
        // .populate({
        //     path: 'reactions',
        //     select: '-__v'
        // })
        .select('-__v')
        .then(dbThought => {
            if (!dbThought) {
                res.status(404).json({ message: 'No thought found with this id!' });
            }
            res.json(dbThought);
        })
        .catch(err => {
            res.status(400).json(err)
        });
    },

    createThought({ body }, res) {
        Thought.create(body)
        .then(({ _id }) => {
            return User.findOneAndUpdate(
                { _id: body.userId },
                {$push: {thoughts: _id } },
                { new: true }
            );
        })
        .then(dbThought => {
            if(!dbThought) {
                res.status(404).json({ message: 'No user found with this id!' });
                return;
            }
            res.json(dbThought);
        })
        .catch(err => res.status(400).json(err));
    },

    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            body,
            { new: true, runValidators: true }
        )
        .then(dbThought => {
            if(!dbThought) {
                res.status(404).json({ message: 'No thought found with this id' });
                return;
            }
            res.json(dbThought);
        })
        .catch(err => res.status(400).json(err));
    },

    deleteThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.thoughtId })
        .then(dbThought => {
            if(!dbThought) {
                res.status(400).json({ message: 'No thought found with this id' });
                return;
            }
            // return User.findOneAndUpdate(
            //     { username: dbThought.username },
            //     {$pull: { thoughts: params.thoughtId } },
            //     { new: true }
            // )
            res.json(dbThought)
        })
        // .then(dbUser => {
        //     if(!dbUser) {
        //         res.status(404).json({ message: 'No user found with this id!' });
        //         return;
        //     }
        //     res.json(dbUser)
        // })
        .catch(err => res.status(400).json(err));
    },

    createReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            {$push: { reactions: body } },
            { new: true }
        )
        .then(dbThought => {
            if(!dbThought) {
                res.status(404).json({ message: 'No thought found with this ID' });
                return;
            }
            res.json(dbThought);
        })
        .catch(err => res.status(400).json(err));
    },

    deleteReaction({ params }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            {$pull: { reactions: {reactionId: params.reactionId } } },
            { new: true }
        )
        .then(dbThought => {
            if(!dbThought) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(dbThought);
        })
        .catch(err => res.status(400).json(err));
    }
};

module.exports = thoughtController;