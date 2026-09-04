const express = require('express');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const leadRoutes = require('./routes/leadRoutes');
const teamRoutes = require('./routes/teamRoutes');
const deliverableRoutes = require('./routes/deliverableRoutes');
const contactRoutes = require('./routes/contactRoutes');
const crmCompanyRoutes = require('./routes/crmCompanyRoutes');
const dealRoutes = require('./routes/dealRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Scale IT OS backend is running!');
});

app.use('/', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/leads', leadRoutes);
app.use('/team', teamRoutes);
app.use('/deliverables', deliverableRoutes);
app.use('/contacts', contactRoutes);
app.use('/companies', crmCompanyRoutes);
app.use('/deals', dealRoutes);
app.use('/activities', activityRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});