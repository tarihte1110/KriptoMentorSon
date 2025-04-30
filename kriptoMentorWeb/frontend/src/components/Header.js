import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>KriptoMentor</h1>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Arama..." />
        </div>
        <div className="header-right">
          <div className="notification">
            {/* İkon için font-awesome veya benzeri kullanabilirsiniz */}
            <i className="fa fa-bell"></i>
          </div>
          <div className="user-avatar">
            {/* Örnek kullanıcı avatarı. Yerel dosya ya da URL kullanılabilir. */}
            <img src="/avatar.png" alt="Kullanıcı Avatarı" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
