universal cellular automata (ca) simulator
==========================================

This repository contains an interpreter for cellular automata written in
JavaScript. It should work in all modern browsers supporting ECMAScript 5.

A running version to play around with can be found on
http://malteschmitz.github.com/ca

The interpreter is able to read files containing two parts seperated by --:
* The first part contains the initial setup and needs to be q square matrix
  of digits.
* The second part specifies the rules of the cellular automata. Every rule
  must be a square matrix of digits. The last line of a rule starts with
  a > followed by the new value of such a configuration.
  
ToDo
----
* Document code.
* Describe format of variables and conditions in rule specifications.
* Use Underscore.js instead of native ES5 features to increase suppport for
  older browsers.