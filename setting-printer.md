### Install Essential for Thermal Printer in Linux ###

To install a dedicated driver in linux it needs the cups(Common Unix Printing System).

```bash
sudo apt update
sudo apt install cups
```

Add your user to the lpadmin Group.

```bash
sudo usermod -aG lpadmin $USER
```

Open cups in your browser.

```bash
http://localhost:631
```

Go to administration -> add printer.
If it requires credential(username and password).

Check if your user is in the lpadmin.

```bash
groups $USER
```

If not add your user in the group.

```bash
sudo usermod -aG lpadmin $USER
```

Verify your user's credential if it would allow to modify in the administration.

Go to administration -> add printer, find your printer.
Then it will ask for "connection", which I have to provide by finding all connected printers with their URIs.

```bash
lpinfo -v
```

Look for uri which somthing like this:

```bash
usb://Honeywell/PC42tp-203-FP?serial=20300B01CC
```

Add the URI as entry for connection.

Pay attention on the field and ensure that only the URI is in the field of connection.

Set printer name and description.
Make sure that there is no white spaces or special characters to avoid errors.

```bash
Honeywell_Thermal
```

After that the list will display with available drivers.
For this instace where honeywell driver is not available, choose "Raw".

Then click continue.

Verify if the printer is able to received request using command in terminal.

```bash
echo "^XA^FO50,50^ADN,36,20^FDHello World^FS^XZ" | lp -d Honeywell_Thermal
```
