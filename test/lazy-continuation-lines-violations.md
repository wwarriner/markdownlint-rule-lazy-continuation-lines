# Lazy Continuation Line Violations

## Varying Indentation

1. List item
lazy
 lazy
    lazy
   ok
   1. List Item
lazy
   lazy
       lazy
      ok

## Blockquotes

> 1. List item
lazy
>    1. List item
lazy

1. > List item
lazy
   1. > List item
lazy

> 1. > List item
lazy
>    1. > List item
lazy

## Second Paragraph

- List item
  ok

  new paragraph
lazy
   lazy
  ok

## Lists with No Content - All OK

1.
    1.

1.
MD032
    1.
MD032

-
  -

-
MD003,MD022
  -
MD022

## Indented Code Block - All OK

1. List item

       code
MD032
