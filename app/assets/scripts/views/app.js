'use strict';
import React from 'react';

var App = React.createClass({
  displayName: 'App',

  propTypes: {
    dispatch: React.PropTypes.func,
    children: React.PropTypes.object
  },

  render: function () {
    return (
      <div>
        <header className='site-header' role='banner'>
          <div className='inner'>
            <div className='site-headline'>
              <h1 className='site-title'>Devseed Sense Lisbon
                {/* <a href='/' title='Visit homepage'>Glacial Inferno</a> */}
              </h1>
            </div>
          </div>
        </header>

        <main className='site-body' role='main'>
          {this.props.children}
        </main>
        <footer className='site-footer' role='footer'>
          <p>Made with love by <a href='https://developmentseed.org' title='Visit Development Seed website'>Development Seed</a> using <a href='http://opensensemap.org' title='Visit OpenSenseMap website'>OpenSenseMap</a> data</p> 
        </footer>
      </div>
    );
  }
});

module.exports = App;
