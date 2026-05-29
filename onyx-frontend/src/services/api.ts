export const sendTask = async (input: string) => {
  const response = await fetch('http://localhost:8000/api/task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send task');
  }
  
  return response.json();
};
