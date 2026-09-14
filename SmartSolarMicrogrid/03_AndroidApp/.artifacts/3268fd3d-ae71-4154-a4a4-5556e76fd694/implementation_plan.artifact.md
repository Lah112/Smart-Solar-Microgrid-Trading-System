# Fix XML Entity Error in Resources

The project fails to build due to an unescaped ampersand (`&`) in an XML resource file. In Android XML files (like `strings.xml` and layout files), the ampersand character must be correctly escaped as `&amp;`. The error message specifically points to line 18, column 37, which matches the position of the ampersand in the `profile` string in `strings.xml`.

## Proposed Changes

### Android Resources

#### [MODIFY] [strings.xml](file:///C:/Users/Kanishka/Desktop/Smart-Solar-Microgrid-Trading-System/SmartSolarMicrogrid/03_AndroidApp/app/src/main/res/values/strings.xml)
- Escape the ampersand in the `profile` string: `Account & Profile` -> `Account &amp; Profile`.

#### [MODIFY] [activity_prosumer_main.xml](file:///C:/Users/Kanishka/Desktop/Smart-Solar-Microgrid-Trading-System/SmartSolarMicrogrid/03_AndroidApp/app/src/main/res/layout/activity_prosumer_main.xml)
- Fix an unescaped ampersand in a comment: `<!-- Header with greeting & logout -->` -> `<!-- Header with greeting &amp; logout -->`.

## Verification Plan

### Automated Tests
- Execute `./gradlew :app:mergeDebugResources` to confirm the resource merging process now completes without SAX errors.
