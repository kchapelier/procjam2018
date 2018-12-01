"use strict";

const { makeElement, simplifyString } = require('./../../commons/utils');

function TypeSelector (typesProvider, callback) {
  this.callback = callback;
  this.element = makeElement('div', { className: 'selector' });
  this.input = makeElement('input', { type: 'text', placeholder: 'Type node name', value: '' });
  this.container = makeElement('div', { className: 'types-container'});

  this.element.appendChild(this.input);
  this.element.appendChild(this.container);

  this.positionX = 0;
  this.positionY = 0;

  const collator = new Intl.Collator("en-u-co-phonetic");
  const types = typesProvider.getAllTypes().sort(function (a, b) {
    return collator.compare(a.name, b.name);
  });

  this.options = [];

  for (let i = 0; i < types.length; i++) {
    const id = types[i].id;
    const name = types[i].name;
    const element = makeElement('div', { className: 'type ' + (types[i].isFilter ? 'type-filter' : 'type-source'), 'data-id': id });
    element.appendChild(makeElement('span', { innerText: name }));

    this.options.push({
      id: id,
      name: simplifyString(name),
      element: element,
      enable: true
    });

    this.container.appendChild(element);
  }

  this.isActive = false;
  this.lastValue = '';

  this.currentOption = null;

  this.addEvents();

  document.body.appendChild(this.element);
}

TypeSelector.prototype.addEvents = function () {
  this.element.addEventListener('mouseover', e => {
    e.stopPropagation();

    const target = e.target.parentNode.classList.contains('type') ? e.target.parentNode : e.target;

    if (target.classList.contains('type')) {
      if (this.currentOption !== null) {
        this.currentOption.classList.remove('hover');
      }

      this.currentOption = target;
      this.currentOption.classList.add('hover');
    }
  });

  this.element.addEventListener('mousedown', e => {
    e.stopPropagation();

    const target = e.target.parentNode.classList.contains('type') ? e.target.parentNode : e.target;

    if (target.classList.contains('type')) {
      this.choose(target.getAttribute('data-id'));
      this.close();
    }
  });

  this.input.addEventListener('keydown', e => {
    e.stopPropagation();

    const code = e.keyCode || e.charCode;

    if (code === 27) {
      this.close();
    } else if (code === 13) {
      if (this.currentOption) {
        this.choose(this.currentOption.getAttribute('data-id'));
      }

      this.close();
    } else if (code === 40) {
      if (this.currentOption.nextElementSibling) {
        this.currentOption.classList.remove('hover');
        this.currentOption = this.currentOption.nextElementSibling;
        this.currentOption.classList.add('hover');
      }
    } else if (code === 38) {
      if (this.currentOption.previousElementSibling) {
        this.currentOption.classList.remove('hover');
        this.currentOption = this.currentOption.previousElementSibling;
        this.currentOption.classList.add('hover');
      }
    }
  });

  this.input.addEventListener('keyup', e => {
    e.stopPropagation();
  });

  this.input.addEventListener('keypress', e => {
    e.stopPropagation();
  });

  this.input.addEventListener('blur', e => {
    e.stopPropagation();

    if (this.isActive) {
      this.close();
    }
  });

  this.input.addEventListener('input', e => {
    const value = simplifyString(this.input.value);

    if (this.lastValue !== value) {
      this.filter(value);
    }
  });
};

TypeSelector.prototype.filter = function (value) {
  if (this.currentOption) {
    this.currentOption.classList.remove('hover');
    this.currentOption = null;
  }

  for (let i = 0; i < this.options.length; i++) {
    if (value.length === 0 || this.options[i].name.indexOf(value) !== -1) {
      this.options[i].enable = true;
      this.container.appendChild(this.options[i].element);

      if (this.currentOption === null) {
        this.currentOption = this.options[i].element;
        this.currentOption.classList.add('hover');
      }
    } else if (this.options[i].element.parentNode !== null) {
      this.options[i].enable = false;
      this.options[i].element.parentNode.removeChild(this.options[i].element);
    }
  }

  this.lastValue = value;
};

TypeSelector.prototype.choose = function (value) {
  this.callback(value);
};

TypeSelector.prototype.open = function () {
  this.isActive = true;
  this.filter('');
  this.input.value = '';
  this.input.focus();
  this.element.style.transform = 'translate(' + this.positionX + 'px, ' + this.positionY + 'px)';
  this.element.classList.add('active');
};

TypeSelector.prototype.close = function () {
  this.element.classList.remove('active');
  this.isActive = false;
  this.input.blur();
};

TypeSelector.prototype.isOpen = function () {
  return this.isActive;
};

TypeSelector.prototype.toggle = function () {
  if (this.isActive) {
    this.close();
  } else {
    this.open();
  }
};

TypeSelector.prototype.setNextPosition = function (x, y) {
  x = Math.max(0, Math.min(window.innerWidth - 202, x - 25));
  y = Math.max(0, Math.min(window.innerHeight - 302, y - 40));
  this.positionX = x;
  this.positionY = y;
};

module.exports = TypeSelector;