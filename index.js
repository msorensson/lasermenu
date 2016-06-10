'use strict';
require('classlist-polyfill');
var assign = require('lodash/assign');
var supportsTransitions = document.createElement('p').style.transform !== undefined;

var Menu = function(el, opts) {
    var self = this;

    self.el = el;
    self.opts = {
        linkSelector: '.menu__link',
        subMenuSelector: '.menu__sub',
        togglerSelector: '.menu__toggler',
        parentSelector: '.menu__item--parent',
        activeTrailSelector: '.menu__item--active-trail',
        openClassName: 'menu__item--open',
        transitioningClassName: 'menu__sub--transitioning',
        init: true,
        useTransition: supportsTransitions
    };

    assign(self.opts, opts);

    self.init = function() {
        self.el = el;

        var parents = self.el.querySelectorAll(self.opts.parentSelector);
        for (var i = 0; i < parents.length; i++) {
            self.appendItem(parents[i]);
        }

        self.openActiveTrails();
    };

    if (self.opts.init) {
        self.init();
    }

    return {
        init: self.init
    };
};

Menu.prototype = {
    removeTransition: function(el) {
        var self = this;
        el.classList.remove(self.opts.transitioningClassName);
    },

    addTransition: function(el) {
        var self = this;
        el.classList.add(self.opts.transitioningClassName);
    },

    appendItem: function(el) {
        var self = this;
        var subMenu = el.querySelector(self.opts.subMenuSelector);
        var link = el.querySelector(self.opts.linkSelector);
        subMenu.style.display = 'none';

        link.addEventListener('click', self.toggle.bind(this));
    },

    toggle: function(e) {
        var self = this;
        var el = e.target,
            parent,
            grandParent,
            subMenu;

        if (!el.classList.contains(self.opts.togglerSelector.replace('.', ''))) {
            return;
        }

        parent = e.target.parentNode;
        parent = parent.parentNode;
        subMenu = parent.querySelector(self.opts.subMenuSelector);

        if (parent.classList.contains(self.opts.openClassName)) {
            self.close(parent);
        } else {
            self.open(parent);
        }

         e.preventDefault();
    },

    open: function(parent, bypassTransition) {
        var self = this;
        var originalHeight;
        var toggler = parent.querySelector(self.opts.togglerSelector);
        var subMenu = parent.querySelector(self.opts.subMenuSelector);

        subMenu.style.display = 'block';
        originalHeight= subMenu.offsetHeight;

        if (self.opts.useTransition && !bypassTransition) {
            subMenu.style.height = '0';
            subMenu.offsetHeight; // Triggers repaint.
            parent.classList.add(self.opts.openClassName);

            subMenu.addEventListener('transitionend', function onEnd(e) {
                self.removeTransition(subMenu);
                subMenu.style.height = 'auto';

                toggler.setAttribute('aria-expanded', true);
                subMenu.setAttribute('aria-hidden', false);

                subMenu.removeEventListener('transitionend', onEnd);
                e.stopPropagation();
            });

            self.addTransition(subMenu);
            subMenu.style.height = originalHeight + 'px';
        } else {
            subMenu.style.height = 'auto';
            parent.classList.add(self.opts.openClassName);

            toggler.setAttribute('aria-expanded', true);
            subMenu.setAttribute('aria-hidden', false);
        }
    },

    close: function(parent, bypassTransition) {
        var self = this;
        var subMenu = parent.querySelector(self.opts.subMenuSelector);
        var toggler = parent.querySelector(self.opts.togglerSelector);
        var originalHeight = subMenu.offsetHeight;

        if (self.opts.useTransition && !bypassTransition) {
            subMenu.style.height = originalHeight + 'px';
            subMenu.offsetHeight; // Triggers repaint.

            subMenu.addEventListener('transitionend', function onEnd(e) {
                self.removeTransition(subMenu);
                parent.classList.remove(self.opts.openClassName);

                toggler.setAttribute('aria-expanded', false);
                subMenu.setAttribute('aria-hidden', true);

                subMenu.style.display = 'none';
                subMenu.style.height = 'auto';
                subMenu.removeEventListener('transitionend', onEnd);
                e.stopPropagation();
            });

            self.addTransition(subMenu);
            subMenu.style.height = '0px';

        } else {
            subMenu.style.height = '0px';
            subMenu.style.display = 'none';
            parent.classList.remove(self.opts.openClassName);
            toggler.setAttribute('aria-expanded', false);
            subMenu.setAttribute('aria-hidden', true);
        }
    },

    openActiveTrails: function() {
        var self = this;
        var items = self.el.querySelectorAll(self.opts.activeTrailSelector),
            subMenu;

        for (var i = 0; i < items.length; i++) {
            subMenu = items[i].querySelector(self.opts.subMenuSelector);

            if (subMenu) {
                self.open(items[i], true);
            }
        }
    }
};

module.exports = Menu;
