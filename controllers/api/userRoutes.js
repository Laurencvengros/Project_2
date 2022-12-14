const router = require('express').Router();
const { User, Routine, Exercise } = require('../../models');

router.get ('/', async(req, res) => {
    try{
        const userData = await User.findAll({
            attributes: {exclude:['password']},
        });
        res.status(200).json(userData);
    } catch(err){
        res.status(500).json(err);
    }
});

router.get('/:id', async (req,res)=>{
  try{
  const userData = await User.findOne({
    where: {id: req.params.id},
    attributes: {exclude:['password']},
    include: [
      {
        model: Routine,
        attributes: ['id', 'name', 'user_id'],
      },
      {
        model: Exercise,
        attributes: ['id', 'name', 'reps', 'sets', 'routine_id'],
        
      },
    ],
  
  });
  res.status(200).json(userData);
  }catch(err){
    res.status(500).json(err);
    
  }

    
});

router.post('/', async (req, res) => {
  //console.log('logging in user:' + req.body.email);
  //console.log(req.body);
    try{
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });
        console.log(req.body)

        //const user = newUser.get({plain: true});
        req.session.save(() => {
            req.session.user_id = newUser.id;
            req.session.name = newUser.name;
            req.session.email = newUser.email;
            req.session.logged_in = true;
            res.status(200).json(newUser);
            
        });
        console.log(newUser)
    }catch(err){
        res.status(500).json(err)
    }
});

router.post('/login', async (req, res) => {
  console.log('logging in user:' + req.body.email);
  console.log(req.body);
    try {

      const userData = await User.findOne({ where: { email: req.body.email } });
      
      if (!userData) {
        console.log('working?')
        res.status(400).json({ message: 'Incorrect email or password, please try again' });
        
        return;
      }
     
      const validPassword = await userData.checkPassword(req.body.password);
  
      if (!validPassword) {
        console.log("password working?")
        res.status(400).json({ message: 'Incorrect email or password, please try again' });
        return;
      }
      const user = userData.get({plain: true});
      
      req.session.save(() => {
        req.session.user_id = user.id;
        req.session.email = user.email;
        req.session.logged_in = true;
        
        res.json({ user: userData, message: 'You are now logged in!' });
      });
  
    } catch (err) {
      res.status(400).json(err);
    }
  });
  
  router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
      req.session.destroy(() => {
        res.status(204).end();
      });
    } else {
      res.status(404).end();
    }
  });

  
  module.exports = router;










