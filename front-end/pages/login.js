import { useState } from 'react';
import { useRouter } from 'next/router';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/administrateur/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);

      // Lisez le corps de la réponse une seule fois
      const responseBody = await response.text();
      console.log('Response body:', responseBody);

      if (response.ok) {
        const data = JSON.parse(responseBody);
        console.log('Connexion réussie, redirection vers /dashboard');
        localStorage.setItem('token', data.token); // Stocker le token JWT
        router.push('/dashboard'); // Rediriger vers le tableau de bord
      } else {
        const errorData = JSON.parse(responseBody); // Parsez le texte en JSON
        setError(errorData.message || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Connexion Administrateur</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Se connecter</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  form: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    marginBottom: '1rem',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '0.8rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  button: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonHover: {
    backgroundColor: '#005bb5',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
    textAlign: 'center',
  },
};

export default Login;