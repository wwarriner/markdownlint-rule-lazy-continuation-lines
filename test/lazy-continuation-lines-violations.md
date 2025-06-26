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

## Strong

- List item **ok**

- List
**lazy**

## Emphasis

- List item _ok_

- List
_lazy_

## Descriptive Link

- List item [ok](ok)

- List
[lazy](lazy)

## Bare Link

- List item <ok.md>

- List
<lazy.md>

## Checkbox

- [] List item ok

## Image

- List item ![!ok](ok)

- List
![!lazy](lazy)

## Code

- List item `ok`

- List
`lazy`

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
