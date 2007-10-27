<?php

class Text
{
  /**
   * Blanks out a portion of a string with whitespace
   * 
   *  @param $to_blank Portion of the string to be removed
   *  @param $string Overall string to remove it from
   */
  public static function blankOut($to_blank, $string) {
    $length = strlen($to_blank);
    if (!$length) {
      return $string;
    }

    $blanks = array_fill(0, $length, ' ');
    return preg_replace('%' . preg_quote($to_blank, '%') . '%', implode($blanks), $string, 1);
  }

  public static function getNextPosition($array, $line_position_pair) {
    list($line_number, $position) = $line_position_pair;
    ++$position;
    if ($position >= strlen($array[$line_number])) {
      ++$line_number;
      $position = 0;
      while (!strlen($array[$line_number])) {
        ++$line_number;
      }
    }
    return array($line_number, $position);
  }

  public static function blankOutAt($to_blank, $start, $end = -1) {
    if ($end == -1) {
      $end = strlen($to_blank) - 1;
    }
    $length = $end - $start + 1;
    if (!$length) {
      return $to_blank;
    }
    if ($length < 0) {
      print 'hi'; // FIXME: squelch errors?
    }
    $blanks = array_fill(0, $length, ' ');
    return substr($to_blank, 0, $start) . implode($blanks) .  substr($to_blank, $end + 1);
  }

  public static function trim($string) {
    return trim(preg_replace('%(^\s*/\*.*\*/\s*?|\s*?/\*.*\*/\s*$|^\s*//.*\n\s*?|\s*?//.*$)%U', '', $string));
  }

  public static function chop($array, $start_line, $start_position, $end_line = false, $end_position = false, $exclusive = false) {
    if (!is_numeric($end_line)) {
      $end_line = end(array_keys($array));
    }
    if (!is_numeric($end_position)) {
      $end_position = strlen($array[$end_line]) - 1;
      if ($end_position < 0) {
        $end_position = 0;
      }
    }

    $lines = array_slice($array, $start_line, $end_line - $start_line + 1, true);
      if ($start_position > 0) {
        $lines[$start_line] = Text::blankOutAt($lines[$start_line], 0, $start_position - 1);
      }
      $lines[$end_line] = Text::blankOutAt($lines[$end_line], $end_position + 1, strlen($lines[$end_line]));
      if ($exclusive) {
        if ($lines[$start_line]{$start_position}) {
          $lines[$start_line]{$start_position} = ' ';
        }
        if ($lines[$end_line]{$end_position}) {
          $lines[$end_line]{$end_position} = ' ';
        }
      }

      return $lines;
  }

  /**
   * Always starts at the beginning. If you want a character to be ignored, it shouldn't be passed (see chop and blankOutAt)
   */
  public static function findTermination($source_array, $termination_characters, $enclosing_characters = '') {
    $characters = array();
    $terminators = array();
    foreach (self::toArray($termination_characters) as $character) { 
      $terminators[$character] = true;
    }
    foreach (self::toArray($enclosing_characters) as $index => $character) {
      $characters[$character] = ($index % 2) ? -1 : 1;
    }
    $all_characters = array_merge(array_keys($terminators), array_keys($characters));

    $balance = 0;

    foreach ($source_array as $line_number => $line) {
      $line = self::toArray($line);
      foreach (array_intersect($line, $all_characters) as $position => $character) {
        if (!$balance && $terminators[$character]) {
          return array($line_number, $position);
        }
        $balance += $characters[$character];
      }
    }

    return array($line_number, $position);
  }

  public static function toArray($string) {
    return array_slice(preg_split('%%', $string), 1, -1);
  }

  /**
   * Splits a comment line up
   *
   * @returns Array(whitespace, comment data, non-comment data, comment data, has non-comment-data, comment continues on next line)
   */
  public static function findComments($line, $started = false) {
    if (empty($line) && !$started) {
      return array($line, false, false, false, false);
    }

    $first = array();
    $middle = array();
    $last = array();
    $data = false;
    $multiline = false;

    if ($started) {
      // If we're already in a (multi-line) comment, look to close it up
      if (($pos = strpos($line, '*/')) !== false) {
        $first[] = trim(substr($line, 0, $pos));
        $line = substr($line, $pos + 2);
      }
      else {
        // We didn't find a terminator, we're still in a multi-line comment
        $multiline = true;
      }
    }

    $single_line = false; // Denotes that we're in a single-line comment.
    if (!$multiline) {
      // Split by //, /*, and */ while ignoring any surrounding whitespace
      $parts = preg_split('%(\s*(?://|/\*|\*/)\s*)%', $line, -1, PREG_SPLIT_DELIM_CAPTURE);
      foreach ($parts as $part) {
        if (!($trimmed = trim($part))) continue;
        if ($multiline && $trimmed == '*/') {
          $multiline = false; // Multi-line ends!
        }
        elseif ($single_line || $multiline) { // If we're within a comment
          if (!$data) {
            $first[] = $part;
          }
          else { // If we've found any non-comment data, we start logging this as "after" the data
            $last[] = $part;
          }
        }
        elseif ($trimmed == '//') {
          $single_line = true;
        }
        elseif ($trimmed == '/*') {
          $multiline = true;
        }
        else {
          $data = true;
          $middle = array_merge($middle, $last);
          $last = array();
        }
      }
    }

    return array(trim(implode('', $first)), trim(implode('', $middle)), trim(implode('', $last)), $data, $multiline);
  }

}

?>