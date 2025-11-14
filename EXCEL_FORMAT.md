# Excel File Format for Attendance

## Location
Place Excel files in: `assets/roll-sheets/`

## File Naming Convention
- `section1.xlsx` - For Section 1
- `section2.xlsx` - For Section 2
- `section3.xlsx` - For Section 3
- `section4.xlsx` - For Section 4

## File Structure

Each Excel file should have the following structure:

### Sheet 1 (First Sheet)
- **Column A (Row 1)**: Header (e.g., "Roll Number" or "Student ID")
- **Column A (Row 2 onwards)**: Roll numbers (one per row)

### Example:

| Roll Number |
|-------------|
| 2021001     |
| 2021002     |
| 2021003     |
| 2021004     |

## Notes
- The system reads from the first sheet only
- Roll numbers should be in the first column
- The header row (Row 1) is automatically skipped
- Roll numbers are treated as strings and trimmed of whitespace
- Empty rows are ignored

## Creating Sample Files

You can create sample Excel files using Microsoft Excel, Google Sheets, or any spreadsheet application. Save them as `.xlsx` format in the `assets/roll-sheets/` directory.

