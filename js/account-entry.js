const accountTabList = document.querySelector('[role="tablist"]');

if (accountTabList) {
  const accountTabs = Array.from(
    accountTabList.querySelectorAll('[role="tab"]'),
  );

  function selectAccountTab(selectedTab, moveFocus = false) {
    accountTabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      const panel = document.getElementById(
        tab.getAttribute("aria-controls"),
      );

      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;

      if (panel) {
        panel.hidden = !isSelected;
      }
    });

    if (moveFocus) {
      selectedTab.focus();
    }
  }

  accountTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectAccountTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % accountTabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + accountTabs.length) % accountTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = accountTabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      selectAccountTab(accountTabs[nextIndex], true);
    });
  });
}

document.querySelectorAll(".account-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
});
