<template>
  <div class="dashboard p-4">

    <!-- HEADER -->
<header class=" mb-4 compact">
  <!-- DATE FILTER -->
  <div class="date-filter-pill compact">
    <div class="pill-input">
      <i class="mdi mdi-calendar-start"></i>
      <input type="date" v-model="filterStart" />
    </div>

    <span class="pill-separator">→</span>

    <div class="pill-input">
      <i class="mdi mdi-calendar-end"></i>
      <input type="date" v-model="filterEnd" />
    </div>

    <button class="pill-btn apply" @click="applyFilter">
      <i class="mdi mdi-filter"></i>
    </button>

    <button class="pill-btn clear" @click="clearFilter">
      <i class="mdi mdi-close"></i>
    </button>
  </div>
</header>

<div class="flex flex-col md:flex-row gap-6">

      <!-- STATS -->
    <div class="stats-grid flex-1">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="stat-card skeleton"></div>
      </template>
      <template v-else>
        <div v-for="card in stats" :key="card.label" class="stat-card" :class="card.color">
          <div class="stat-title">{{ card.label }}</div>
          <div class="stat-value">{{ card.value.toLocaleString() }}</div>
        </div>
      </template>
    </div>

    <!-- SUMMARY -->
    <div class="summary-grid flex-1">
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="summary-card skeleton"></div>
      </template>
      <template v-else>
        <div v-for="item in summary" :key="item.label" class="summary-card">
          <div class="summary-title">{{ item.label }}</div>
          <div class="summary-value" :class="item.value >= 0 ? 'text-green' : 'text-red'">
            {{ item.value.toLocaleString() }}
          </div>
        </div>
      </template>
    </div>

</div>



    <!-- RECENT TRANSACTIONS -->
    <div class="transactions-card">

      <!-- TAB TOGGLE -->
      <div class="tab-toggle">
        <button :class="{ active: transactionTab === 'All' }" @click="transactionTab = 'All'">All</button>
        <button :class="{ active: transactionTab === 'Deposit' }" @click="transactionTab = 'Deposit'">Deposit</button>
        <button :class="{ active: transactionTab === 'Withdraw' }" @click="transactionTab = 'Withdraw'">Withdraw</button>
      </div>


      <v-data-table
  :headers="headers"
  :items="displayedTransactions"
   dense
>
  <!-- Date -->
  <template #item.created_at="{ item }">
    {{ formatDate(item.created_at) }}
  </template>

  <!-- User -->
  <template #item.user_id="{ item }">
    #{{ item.user_id }}
  </template>

  <!-- Amount -->
  <template #item.amount="{ item }">
    <span :class="item.type === 'Deposit' ? 'text-green' : 'text-red'">
      {{ item.amount }}
    </span>
  </template>

  <!-- Status -->
  <template #item.status="{ item }">
    <span
      :class="{
        'status-ok': item.status === 'approved',
        'status-warn': item.status === 'processing',
        'status-bad': item.status === 'failed' || item.status === 'rejected'
      }"
    >
      {{ item.status }}
    </span>
  </template>

  <!-- Empty state -->
  <template #no-data>
    <div class="text-center text-grey py-4">
      No transactions found
    </div>
  </template>
</v-data-table>


      <!-- <table v-else class="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in displayedTransactions" :key="t.id">
            <td>{{ formatDate(t.created_at) }}</td>
            <td>#{{ t.user_id }}</td>
            <td>{{ t.type }}</td>
            <td :class="t.type === 'Deposit' ? 'text-green' : 'text-red'">{{ t.amount }}</td>
            <td>
              <span :class="{
                'status-ok': t.status === 'approved',
                'status-warn': t.status === 'processing',
                'status-bad': t.status === 'failed' || t.status === 'rejected'
              }">{{ t.status }}</span>
            </td>
          </tr>
          <tr v-if="displayedTransactions.length === 0">
            <td colspan="5" class="text-center text-grey">No transactions found</td>
          </tr>
        </tbody>
      </table> -->
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"

// ---------- DATA ----------
const deposits = ref([])
const withdrawals = ref([])
const loading = ref(true)

// Date filter
const filterStart = ref('')
const filterEnd = ref('')

const headers = [
    { title: "User", value: "user_name" },
  { title: "Date", value: "created_at" },

  { title: "Type", value: "type" },
  { title: "Amount", value: "amount" },
    { title: "Bonus", value: "bonus_amount" },
  { title: "Status", value: "status" },
];


// Transaction tab: All / Deposit / Withdraw
const transactionTab = ref('All')

// ---------- FETCH ----------
const fetchData = async () => {
  loading.value = true
  try {
    const [depRes, witRes] = await Promise.all([
      fetch("https://api.bajiraj.cloud/deposit"),
      fetch("https://api.bajiraj.cloud/withdrawals")
    ])
    const dep = await depRes.json()
    const wit = await witRes.json()

    deposits.value = dep || []
    withdrawals.value = wit || []
    console.log(deposits.value, withdrawals.value)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
    applyFilter()
  }
}

onMounted(fetchData)

// ---------- HELPERS ----------
const formatDate = date => new Date(date).toLocaleString()
const isToday = date => new Date(date).toDateString() === new Date().toDateString()
const isThisWeek = date => new Date() - new Date(date) < 7 * 86400000
const isThisMonth = date => {
  const d = new Date(date)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

// ---------- FILTERED DATA ----------
const filteredDeposits = ref([])
const filteredWithdrawals = ref([])
const filteredTransactions = ref([])

// Apply date filter
const applyFilter = () => {
  const start = filterStart.value ? new Date(filterStart.value) : new Date('1970-01-01')
  const end = filterEnd.value ? new Date(filterEnd.value) : new Date()

  filteredDeposits.value = deposits.value.filter(d => {
    const date = new Date(d.created_at)
    return date >= start && date <= end
  })

  filteredWithdrawals.value = withdrawals.value.filter(w => {
    const date = new Date(w.created_at)
    return date >= start && date <= end
  })

  filteredTransactions.value = [
    ...filteredDeposits.value.map(d => ({ ...d, type: "Deposit" })),
    ...filteredWithdrawals.value.map(w => ({ ...w, type: "Withdraw" }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

// Clear filter
const clearFilter = () => {
  filterStart.value = ''
  filterEnd.value = ''
  applyFilter()
}

// ---------- STATS ----------
const stats = computed(() => {
  const totalDep = filteredDeposits.value.reduce(
  (sum, d) => sum + Number(d.amount) - Number(d.bonus_amount || 0),
  0
);
  const totalDepBonus = filteredDeposits.value.reduce((a, b) => a + +b?.bonus_amount, 0)
  const totalWit = filteredWithdrawals.value.reduce((a, b) => a + +b.amount, 0)
  const netProfit = totalDep - totalWit

  return [
    { label: "Total Deposit", value: totalDep, color: "green" },
     { label: "Total Bonus", value: totalDepBonus, color: "red" },
    { label: "Total Withdraw", value: totalWit, color: "red" },
    { label: "Net Profit", value: netProfit, color: netProfit >= 0 ? "green" : "red" },
    { label: "Transactions", value: filteredDeposits.value.length + filteredWithdrawals.value.length, color: "purple" }
  ]
})

const calcProfit = (filterFn) =>
  deposits.value.filter(d => filterFn(d.created_at)).reduce((a, b) => a + +b.amount, 0) -
  withdrawals.value.filter(w => filterFn(w.created_at)).reduce((a, b) => a + +b.amount, 0)

const summary = computed(() => [
  { label: "Today", value: calcProfit(isToday) },
  { label: "This Week", value: calcProfit(isThisWeek) },
  { label: "This Month", value: calcProfit(isThisMonth) }
])

// ---------- TAB FILTER ----------
const displayedTransactions = computed(() => {
  if (transactionTab.value === 'All') return filteredTransactions.value
  return filteredTransactions.value.filter(t => t.type === transactionTab.value)
})
</script>

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

.stat-card {
  padding: 22px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent,
    rgba(99, 102, 241, 0.08)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::after {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-title {
  font-size: 13px;
  color: #64748b;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-top: 6px;
  color: #020617;
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
  background: linear-gradient(180deg, #ffffff, #f8fafc);
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
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
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
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Value */
.stat-value {
  font-size: 22px;
  font-weight: 700;
  margin-top: 4px;
  color: #020617;
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
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}
.summary-card {
  padding: 14px 16px;
  border-radius: 14px;
  background: #3f3863;
  
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease;
  height: 80px;
}

.summary-card:hover {
  transform: translateY(-1px);
}

/* Title */
.summary-title {
  font-size: 16px;
  color: #ebedf0;
}

/* Value */
.summary-value {
  font-size: 18px;
  font-weight: 700;
  margin-top: 6px;
}

</style>
