import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Login from './pages/Login';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import HomeProfile from './components/HomeProfile';
import HomeAside from './components/HomeAside';
import Logout from './pages/Logout';
import UserProfile from './pages/UserProfile';
import EditProfile from './components/EditProfile';
import SinglePost from './pages/SinglePost';
import AccountsListPage from './pages/AccountsListPage';
import PrivateRoute from './PrivateRoute';
import SignUp from './pages/SignUp';
import { AuthProvider } from './context/context';

function App() {
  return (
    <div className="App">
      <section className="main">
        <AuthProvider>
          <Header className="App-header"/>
          <BrowserRouter>
            <Switch>
              <Route path="/login" component={Login}/>
              <Route path="/signup" component={SignUp}/>
              <Route path="/logout" component={Logout}/>
              <PrivateRoute exact path="/" component={Home}/>
              <PrivateRoute path="/home" component={Home}/>
              <PrivateRoute exact path="/post/:postId" component={SinglePost}/>
              <PrivateRoute path="/:username/following" component={AccountsListPage}/>
              <PrivateRoute path="/:username/followers" component={AccountsListPage}/>
              <PrivateRoute path="/:username" component={UserProfile}/>
            </Switch>
          </BrowserRouter>  
        </AuthProvider>
      </section>
    </div>
  );
}

export default App;
