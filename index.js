const express = require('express');
const supabase = require('./supabaseClient');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Scale IT OS backend is running!');
});

app.get('/test-db', async (req, res) => {
  const { data, error } = await supabase.from('test').select('*');
  if (error) {
    res.send('Connected to Supabase, but no table named "test" yet. That is expected for now.');
  } else {
    res.json(data);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});