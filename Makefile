# Local helpers for the Daily Briefing. Override on the command line, e.g.
#   make brief DATE=2026-10-12 SECRET=other
SECRET ?= local-dev
PORT   ?= 3000
DATE   ?=

.PHONY: dev brief

# Dev server with the generate-endpoint secret set.
dev:
	CRON_SECRET=$(SECRET) npm run dev

# Trigger a real generation (costs ~$0.02). Omit DATE to generate today (ET).
# Delete the resulting content/briefings/<date>.json before committing.
brief:
	curl -sS -X POST localhost:$(PORT)/api/briefing/generate \
	  -H "Authorization: Bearer $(SECRET)" \
	  -H "Content-Type: application/json" \
	  -d '$(if $(DATE),{"date":"$(DATE)"},{})'
	@echo
