export default function convertDate(array: string) {
  let convertedDate = [];
  let data = array.split("/");
  let date = new Date(Number(data[2]), Number(data[1]) - 1, Number(data[0]));

  let months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  let days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  let day = date.getDay();
  let month = date.getMonth();
  let year = date.getFullYear();

  let dayName = days[day];
  let monthName = months[month];
  let result = `${dayName}, ${data[0]} ${monthName} ${year}`;
  convertedDate.push(result);
  return convertedDate;
}