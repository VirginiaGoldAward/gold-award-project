(function () {
  const form = document.getElementById("feedback-form");
  const list = document.getElementById("feedback-list");

  if (!form || !list) {
    return;
  }

  const totalResponsesEl = document.getElementById("total-responses");
  const avgRatingEl = document.getElementById("avg-rating");
  const recommendationScoreEl = document.getElementById("recommendation-score");

  const STORAGE_KEY = "gold_award_feedback";

  function loadEntries() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function calcMetrics(entries) {
    const total = entries.length;
    if (!total) {
      return { total: 0, average: 0, recommendationScore: 0 };
    }

    const ratings = entries.map((entry) => Number(entry.rating));
    const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
    const recommendCount = ratings.filter((rating) => rating >= 4).length;

    return {
      total,
      average: totalRating / total,
      recommendationScore: (recommendCount / total) * 100,
    };
  }

  function render(entries) {
    list.innerHTML = "";

    if (!entries.length) {
      list.innerHTML = "<p>No feedback submitted yet.</p>";
    } else {
      entries
        .slice()
        .reverse()
        .forEach((entry) => {
          const item = document.createElement("article");
          item.className = "feedback-item";

          const name = entry.name ? entry.name : "Anonymous";
          item.innerHTML =
            "<p><strong>" +
            name +
            "</strong> | " +
            entry.role +
            " | Rating: " +
            entry.rating +
            "/5</p>" +
            "<p>" +
            entry.comment +
            "</p>" +
            "<p><small>" +
            entry.date +
            "</small></p>";

          list.appendChild(item);
        });
    }

    const metrics = calcMetrics(entries);
    totalResponsesEl.textContent = String(metrics.total);
    avgRatingEl.textContent = metrics.average.toFixed(1);
    recommendationScoreEl.textContent = Math.round(metrics.recommendationScore) + "%";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const ratingValue = Number(formData.get("rating"));
    if (ratingValue < 1 || ratingValue > 5) {
      return;
    }

    const entry = {
      name: String(formData.get("name") || "").trim(),
      role: String(formData.get("role") || "").trim(),
      rating: ratingValue,
      comment: String(formData.get("comment") || "").trim(),
      date: new Date().toLocaleDateString(),
    };

    if (!entry.role || !entry.comment) {
      return;
    }

    const entries = loadEntries();
    entries.push(entry);
    saveEntries(entries);
    render(entries);
    form.reset();
  });

  render(loadEntries());
})();
