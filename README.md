# Salesforce Package.xml Power Tools

This is a simple extention that can automate the creation and merging of Salesforce Package.xml files.

## Features

# Generate Packages

You can automatically generate a salesforce package containing every change in the current git branch.
1. From the command Palette:
    * "Generate Salesforce Package with default settings" will utilize the configuration options "Package Generate: Default Package Location" and "Package Generate: Default Package Name"  to generate an xml file on the default location.
    * "Generate Salesforce Package with default location" will utilize the configuration option "Package Generate: Default Package Location" to generate an xml file on the default location, with a user-supplied name.
    * "Generate Salesforce Package" will promt the user for a destination folder and a file name to generate an xml file.
2. From the editor context menu:
    * "Generate Salesforce Package here" will generate the xml in the currently open file.
3. From the explorer context menu:
    * "Generate Salesforce Package here" will generate the xml in the currently selected file.

# Merge Packages

You can automatically merge two salesforce package files.
1. From the command Palette:
    * "Merge Salesforce Packages" -> "Select source file" -> "Select Destination File"
2. From the editor context menu:
    * "Merge Salesforce Packages" -> "Select Destination File"
    * "Select source package to merge" -> "Select destination package to merge" -> "Merge Selected Packages"
    * "Select source package to merge" -> "Merge Selected source Package here"
3. From the explorer context menu:
    * "Merge Salesforce Packages" -> "Select Destination File"
    * "Select source package to merge" -> "Select destination package to merge" -> "Merge Selected Packages"
    * "Select source package to merge" -> "Merge Selected source Package here"

## Configuration

Package xml power tools exposes the following configuration parameters:
* Package Xml Power Tools: Indentation Type: The character used for indentation
* Package Xml Power Tools: Indentation Number: The number of times the Indentation Type will be repeated for a single indent.
* Package Xml Power Tools: Metadata Api Version: The Salesforce API version that will be used for the creation of the xml file.
* Package Xml Power Tools › Package Generate: Default Package Location: The default folder to generate a new xml file (used with "Generate Salesforce Package with default settings" and "Generate Salesforce Package with default location").
* Package Xml Power Tools › Package Generate: Default Package Name: The default xml file name used to generate a new xml file (used with "Generate Salesforce Package with default settings").
* Package Xml Power Tools › Package Merge: Default Package Location: The folder that will open by default when using "Merge Salesforce Packages".


Please report any issues or feature requests [here](https://github.com/AndronikosKon/salesforce-package-xml-power-tools/issues)
