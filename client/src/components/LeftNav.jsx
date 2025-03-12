import React from 'react';
import { NavLink } from 'react-router-dom';

const LeftNav = () => {
  return (
    <div className='left-nav-container'>
      <div className='icons'>
        <div className='icons-bis'>
          <NavLink
            to='/'
            end
            className={({ isActive }) => (isActive ? 'active-left-nav' : undefined)}
            aria-label='Accueil'
          >
            <img src="./img/icons/home.svg" alt="home"/>
          </NavLink>
          <br />
          <NavLink
            to='/trending'
            className={({ isActive }) => (isActive ? 'active-left-nav' : undefined)}
            aria-label='Tendances'
          >
            <img src="./img/icons/trend.svg" alt="trend"/>
            </NavLink>
          <br />
          <NavLink
            to='/profil'
            className={({ isActive }) => (isActive ? 'active-left-nav' : undefined)}
            aria-label='Profil'
          >
            <img src="./img/icons/user.svg" alt="user"/>
            </NavLink>
          <br />
        </div>
      </div>
    </div>
  );
};

export default LeftNav;
