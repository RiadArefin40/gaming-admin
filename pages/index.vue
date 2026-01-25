<template>
  <div class="dashboard p-4 ">

    <!-- HEADER -->
<!-- HEADER -->
<header class="mb-4 compact flex gap-4 flex-col md:flex-row">


</header>

     <div  class=" px-2 ">
          <p class="text-xl">Exp: 17/6/2026</p>
        </div>
<div class="flex flex-col my-8 gap-6">

      <!-- STATS -->
    <div class="">


        <div  class="bg-slate-200 px-8 py-2" >
          <div class="text-2xl">Active Package</div>
          <div class="">PT-4 (3000)</div>
        </div>
   
 
    </div>
 



</div>

<div class="flex   gap-6">

            <!-- STATS -->
    <div class="">


        <div  class="bg-slate-200 p-2" >
          <div class="text-2xl">Whatsapp</div>
          <div class="text-green-900 font-bold">6971/7000</div>
        </div>
 
    </div>
        <div class="">


        <div  class="bg-slate-200 p-2" >
          <div class="text-2xl">ORT SMS</div>
          <div class="text-red-700 font-bold">7000/0</div>
        </div>
 
    </div>
</div>




  </div>
</template>



<style>
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 22px;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.header-left h2 {
  font-size: 24px;
  font-weight: 700;
  color: #020617;
}

.subtitle {
  font-size: 13px;
  color: #64748b;
}

/* Filter */
.date-filter {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.date-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-input label {
  font-size: 11px;
  color: #64748b;
}

.date-input input {
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 13px;
  transition: all 0.2s ease;
}

.date-input input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* Buttons */
.btn {
  padding: 9px 16px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: #fff;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
}

.btn-ghost {
  background: transparent;
  color: #475569;
}

.btn-ghost:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* stats card styling */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}







/* .stat-title {
  font-size: 13px;
  color: #ebeff3;
} */

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 6px;
  color: #dee0e6;
}

/* Color accents */
.stat-card.green { border-left: 4px solid #22c55e; }
.stat-card.blue { border-left: 4px solid #6366f1; }
.stat-card.orange { border-left: 4px solid #f97316; }
.stat-card.red { border-left: 4px solid #ef4444; }



/* summary card design */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.summary-card {
  padding: 20px;
  border-radius: 18px;
  background-color: rgba(0, 0, 0, 0.05) ;
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}



.summary-value {
  font-size: 22px;
  font-weight: 700;
  margin-top: 8px;
}

.text-green { color: #22c55e; }
.text-red { color: #ef4444; }


.skeleton {
  background: linear-gradient(
    90deg,
    #f1f5f9,
    #e2e8f0,
    #f1f5f9
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}


/* table */
.transactions-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 22px;
  margin-top: 24px;
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.transactions-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #020617;
}

/* toggle tabs */
.tab-toggle {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  background: #f1f5f9;
  margin-bottom: 18px;
}

.tab-toggle button {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 999px;
  color: #475569;
  transition: all 0.25s ease;
}

.tab-toggle button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.tab-toggle button.active {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: white;
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35);
}

/* data table */
/* Table wrapper */
.transactions-card .v-data-table {
  border-radius: 16px;
  overflow: hidden;
}

/* Header */
.transactions-card thead th {
  font-size: 16px;
  letter-spacing: 0.05em;
  color: #383838;
  background: #f8fafc;
}

/* Rows */
.transactions-card tbody tr {
  transition: background 0.2s ease;
}

.transactions-card tbody tr:hover {
  background: #f8fafc;
}

/* Cells */
.transactions-card td {
  font-size: 13px;
  color: #020617;
  padding: 14px 12px;
}
.text-green {
  color: #16a34a;
  font-weight: 600;
}

.text-red {
  color: #dc2626;
  font-weight: 600;
}
.status-ok,
.status-warn,
.status-bad {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  text-transform: capitalize;
}

/* Approved */
.status-ok {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

/* Processing */
.status-warn {
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
}

/* Failed / Rejected */
.status-bad {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.transactions-card tbody tr td:first-child {
  position: relative;
}

.transactions-card tbody tr td:first-child::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 3px;
  border-radius: 999px;
  background: #e2e8f0;
}
.transactions-card tbody tr {
  animation: fadeRow 0.25s ease-in;
}

@keyframes fadeRow {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.date-filter-pill {
  display: flex;
  align-items: center;
  max-width: max-content;
  border-radius: 999px;
  background: #f8fafc;
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.06);
}

/* Date pill */
.pill-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.pill-input i {
  color: #6366f1;
  font-size: 16px;
}

.pill-input input {
  border: none;
  background: transparent;
  font-size: 13px;
  color: #020617;
}

.pill-input input:focus {
  outline: none;
}

/* Arrow */
.pill-separator {
  font-size: 14px;
  color: #94a3b8;
}

/* Buttons */
.pill-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.pill-btn.apply {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: white;
}

.pill-btn.apply:hover {
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.35);
}

.pill-btn.clear {
  background: transparent;
  color: #64748b;
}

.pill-btn.clear:hover {
  background: rgba(0, 0, 0, 0.06);
}

/* Header compact */
.dashboard-header.compact {
  padding: 14px 18px;
  margin-bottom: 16px;
  border-radius: 16px;
}

/* Title */
.dashboard-header.compact h2 {
  font-size: 18px;
  font-weight: 700;
}

.dashboard-header.compact .subtitle {
  font-size: 11px;
}

/* Compact pill wrapper */
.date-filter-pill.compact {
  padding: 6px;
  gap: 6px;
}

/* Compact date input */
.date-filter-pill.compact .pill-input {
  padding: 5px 10px;
  gap: 6px;
}

.date-filter-pill.compact input {
  font-size: 12px;
  max-width: 120px;
}

/* Icons smaller */
.date-filter-pill.compact i {
  font-size: 14px;
}

/* Compact buttons */
.date-filter-pill.compact .pill-btn {
  padding: 6px 8px;
  min-width: unset;
}

.date-filter-pill.compact .pill-btn.apply {
  box-shadow: none;
}

/* Remove extra glow */
.date-filter-pill.compact .pill-btn.apply:hover {
  box-shadow: 0 6px 14px rgba(99, 102, 241, 0.25);
}

/* Separator */
.date-filter-pill.compact .pill-separator {
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}
.stat-card {
  position: relative;
  padding: 64px 26px;
  text-align: center;
  border-radius: 16px;
background: #3f3863;
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  overflow: hidden;
}

/* Hover */
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(99, 102, 241, 0.15);
}

/* Accent strip */
.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #6366f1, #22d3ee);
  opacity: 0.9;
}

/* Title */
.stat-title {
  font-size: 20px;
  font-weight: 900;
  color: #ffffff;
  /* text-transform: uppercase; */
  letter-spacing: 0.04em;
}

/* Value */
.stat-value {
  font-size: 22px;
  font-weight: 700;
  margin-top: 4px;
  color: #ffffff;
}
.stat-card.green::before {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.stat-card.blue::before {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}

.stat-card.orange::before {
  background: linear-gradient(90deg, #f97316, #fb923c);
}

.stat-card.red::before {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.summary-grid {
display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}
.summary-card {
 padding: 44px 26px;
  border-radius: 14px;
  background: #3f3863;
  text-align: center;
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease;

}

.summary-card:hover {
  transform: translateY(-1px);
}

/* Title */
.summary-title {
  font-size: 28px;
  color: #ffffff;
}

/* Value */
.summary-value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 6px;
}

</style>
