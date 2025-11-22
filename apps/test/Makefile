.PHONY: install build watch serve deploy clean

.ONESHELL:

install:
	@echo "📦 Installing dependencies from root..."
	@cd ../.. && pnpm install

build:
	@echo "🔨 Building function..."
	@pnpm exec tsup
	@echo "✅ Build complete."

watch:
	@echo "🔨 Building function..."
	@pnpm exec tsup --watch
	@echo "✅ Build complete."

serve:
	@echo "🚀 Starting emulator..."
	@firebase emulators:start --only functions

deploy:
	@echo "☁️  Deploying to Firebase..."
	@firebase deploy --only functions

clean:
	@echo "🧹 Cleaning dist..."
	@pnpm exec rimraf dist