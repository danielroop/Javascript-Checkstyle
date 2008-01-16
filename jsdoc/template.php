<?php

// Use this theme function to do a final manipulation of the form

function phptemplate_jsdoc_object_form($form) {
}

// Use these functions to create the equivalent tpl.php files

function phptemplate_jsdoc_object_resources($node) {
  return _phptemplate_callback('jsdoc_object_resources', array('node' => $node));
}

function phptemplate_jsdoc_object_type($node) {
  return _phptemplate_callback('jsdoc_object_type', array('node' => $node));
}

function phptemplate_jsdoc_function($node) {
  return _phptemplate_callback('jsdoc_function', array('node' => $node));
}

function phptemplate_jsdoc_object($node) {
  return _phptemplate_callback('jsdoc_object', array('node' => $node));
}

function phptemplate_jsdoc_parent($node) {
  return _phptemplate_callback('jsdoc_parent', array('node' => $node));
}

function phptemplate_jsdoc_class_list($nodes) {
  return _phptemplate_callback('jsdoc_class_list', array('nodes' => $nodes));
}

function phptemplate_jsdoc_function_list($nodes) {
  return _phptemplate_callback('jsdoc_function_list', array('nodes' => $nodes));
}

function phptemplate_jsdoc_field_list($nodes) {
  return _phptemplate_callback('jsdoc_field_list', array('nodes' => $nodes));
}

function phptemplate_jsdoc_any_list($nodes) {
  return _phptemplate_callback('jsdoc_any_list', array('nodes' => $nodes));
}
