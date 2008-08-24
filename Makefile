include package.conf

all: package


generate:
	@scripts/generate.sh package.conf && \
	cd $(BUILDDIR)/chrome && \
	../../scripts/generate_jar.sh fireman.jar

package: generate
	@cp LICENSE $(BUILDDIR)/ && \
	cd $(BUILDDIR) && \
	../scripts/generate_xpi.sh ../$(APPNAME).xpi fireman.jar

clean:
	@echo "    CLN build"; rm -rf build

distclean: clean
	@echo "    CLN $(APPNAME).xpi"; rm -f $(APPNAME).xpi
