import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Menu.module.css';
import { menu } from './data';
import '../../../styles/global.css';

const Menu = () => {

  return (
    <div className={styles.menu}>
      {menu.map((item) => (
        <div className={styles.item} key={item.id}>
          <span className={styles.title}>{item.title}</span>
          {item.listItems.map((listItem) => (
            <NavLink
              to={listItem.url}
              className={({ isActive }) => isActive ? `${styles.listItem} ${styles.active}` : styles.listItem}
              key={listItem.id}
            >
              <img src={listItem.icon} alt="" />
              <span className={styles.listItemTitle}>{listItem.title}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;

